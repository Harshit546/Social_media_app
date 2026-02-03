"use strict";
/**
 * Authentication Service
 *
 * Contains business logic for user authentication.
 * Responsibilities:
 * - User registration
 * - User login
 * - Password hashing & verification
 * - JWT generation
 *
 * Controllers should remain thin and delegate auth logic here.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
/**
 * Register a new user or reactivate a soft-deleted account
 *
 * Flow:
 * 1. Validate required inputs
 * 2. Check for existing active user
 * 3. If email exists but is soft-deleted, reactivate and update password
 * 4. If email is new, hash password and create new user
 * 5. Generate JWT for immediate authentication
 *
 * Benefits:
 * - Allows users to re-register the same email after account deletion
 * - Preserves user history and relationships in the database
 *
 * @param email - User email
 * @param password - Plain text password (hashed before storage)
 * @returns User record (newly created or reactivated) and authentication token
 */
const registerUser = async (email, password) => {
    try {
        // Validate input
        if (!email || !password) {
            throw new errors_1.BadRequestError("Email and password are required");
        }
        // Check for active user with this email
        const activeUser = await user_model_1.default.findOne({ email, isDeleted: false });
        if (activeUser) {
            throw new errors_1.ConflictError("Email is already in use by an active account");
        }
        // Check for soft-deleted user with this email (to reactivate)
        const deletedUser = await user_model_1.default.findOne({ email, isDeleted: true });
        // Hash password before saving
        const hashed = await (0, hash_1.hashPassword)(password);
        let user;
        if (deletedUser) {
            // Reactivate the soft-deleted account with new password
            deletedUser.password = hashed;
            deletedUser.isDeleted = false;
            user = await deletedUser.save();
        }
        else {
            // Create brand new user
            user = await user_model_1.default.create({
                email,
                password: hashed
            });
        }
        // Generate JWT for authentication
        const token = (0, jwt_1.signJwt)({
            id: user._id,
            email: user.email,
            role: user.role
        });
        return { user, token };
    }
    catch (error) {
        // Known domain errors
        if (error instanceof errors_1.ConflictError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        // Handle MongoDB unique constraint race condition
        if (error.code === 11000) {
            throw new errors_1.ConflictError("Email already in use");
        }
        // Unexpected database failure
        throw new errors_1.DatabaseError("Failed to register user");
    }
};
exports.registerUser = registerUser;
/**
 * Authenticate an existing user
 *
 * Flow:
 * 1. Validate input
 * 2. Fetch user by email
 * 3. Reject deleted accounts
 * 4. Compare hashed passwords
 * 5. Issue JWT on success
 *
 * @param email - User email
 * @param password - Plain text password
 * @returns Authenticated user and JWT token
 */
const loginUser = async (email, password) => {
    try {
        // Validate input
        if (!email || !password) {
            throw new errors_1.BadRequestError("Email and password are required");
        }
        // Retrieve user by email
        const user = await user_model_1.default.findOne({ email });
        // Reject invalid or soft-deleted accounts
        if (!user || user.isDeleted) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        // Compare password hashes
        const isMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        // Generate authentication token
        const token = (0, jwt_1.signJwt)({
            id: user._id,
            email: user.email,
            role: user.role
        });
        return { user, token };
    }
    catch (error) {
        // Known authentication errors
        if (error instanceof errors_1.UnauthorizedError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        // Unexpected database / infrastructure failure
        throw new errors_1.DatabaseError("Login failed");
    }
};
exports.loginUser = loginUser;
