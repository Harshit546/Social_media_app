"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const hash_1 = require("../utils/hash");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const registerUser = async (email, password) => {
    try {
        if (!email || !password) {
            throw new errors_1.BadRequestError("Email and password are required");
        }
        const isExisting = await user_model_1.default.findOne({ email });
        if (isExisting) {
            throw new errors_1.ConflictError("User with this email already exists");
        }
        const hashed = await (0, hash_1.hashPassword)(password);
        const user = await user_model_1.default.create({ email, password: hashed });
        const token = (0, jwt_1.signJwt)({ id: user._id, email: user.email, role: user.role });
        return { user, token };
    }
    catch (error) {
        if (error instanceof errors_1.ConflictError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        if (error.code === 11000) {
            throw new errors_1.ConflictError("Email already registered");
        }
        throw new errors_1.DatabaseError("Failed to register user");
    }
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    try {
        if (!email || !password) {
            throw new errors_1.BadRequestError("Email and password are required");
        }
        const user = await user_model_1.default.findOne({ email });
        if (!user || user.isDeleted) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        const isMatch = await (0, hash_1.comparePassword)(password, user.password);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError("Invalid email or password");
        }
        const token = (0, jwt_1.signJwt)({ id: user._id, email: user.email, role: user.role });
        return { user, token };
    }
    catch (error) {
        if (error instanceof errors_1.UnauthorizedError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Login failed");
    }
};
exports.loginUser = loginUser;
