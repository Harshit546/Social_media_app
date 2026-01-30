"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const apiError_1 = require("./apiError");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET environment variable is not set, using default");
}
const signJwt = (payload, expiresIn = "1h") => {
    try {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
    }
    catch (error) {
        throw new apiError_1.ApiError(500, "Failed to sign JWT token");
    }
};
exports.signJwt = signJwt;
const verifyJwt = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new apiError_1.ApiError(401, "Token has expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw new apiError_1.ApiError(401, "Invalid token");
        }
        throw new apiError_1.ApiError(401, "Token verification failed");
    }
};
exports.verifyJwt = verifyJwt;
;
