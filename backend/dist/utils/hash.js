"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const errors_1 = require("./errors");
const hashPassword = async (password) => {
    try {
        if (!password) {
            throw new Error("Password is required");
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        return await bcryptjs_1.default.hash(password, salt);
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to hash password");
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    try {
        if (!password || !hash) {
            throw new Error("Password and hash are required");
        }
        return await bcryptjs_1.default.compare(password, hash);
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to compare passwords");
    }
};
exports.comparePassword = comparePassword;
