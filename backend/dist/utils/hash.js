"use strict";
/**
 * Password Hashing Utility Module
 *
 * Provides secure password hashing and comparison using bcryptjs.
 *
 * Security considerations:
 * - Uses 10 salt rounds for hashing
 * - Constant-time comparison to prevent timing attacks
 * - Plain text passwords are never stored
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("./errors");
/**
 * Hash a plain text password
 *
 * Used during user registration before storing password in DB
 *
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password string
 * @throws DatabaseError - If hashing fails
 */
const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new Error("Password is required");
        }
        // Generate salt and hash the password
        const salt = await bcryptjs_1.default.genSalt(10);
        return await bcryptjs_1.default.hash(password, salt);
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to hash password");
    }
};
exports.hashPassword = hashPassword;
/**
 * Compare plain text password with hashed password
 *
 * Used during login to verify credentials
 *
 * @param password - Plain text password input
 * @param hash - Hashed password stored in DB
 * @returns Promise<boolean> - True if passwords match
 * @throws DatabaseError - If comparison fails
 */
const comparePassword = async (password, hash) => {
    try {
        if (!password || !hash) {
            throw new Error("Password and hash are required");
        }
        // bcrypt.compare handles constant-time comparison
        return await bcryptjs_1.default.compare(password, hash);
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to compare passwords");
    }
};
exports.comparePassword = comparePassword;
