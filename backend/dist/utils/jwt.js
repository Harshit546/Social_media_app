"use strict";
/**
 * JWT Utility Module
 *
 * Provides functions to:
 * - Sign JWT tokens (for authentication)
 * - Verify JWT tokens (for protecting routes)
 *
 * Environment variables:
 * - JWT_SECRET (required): Secret key for signing tokens
 * - JWT_EXPIRES_IN (optional): Token expiration duration (default: 24h)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = exports.signJwt = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("./errors");
// Fail fast if JWT_SECRET not provided
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is not set");
    console.error("Please create a .env file with JWT_SECRET=your_secret_key");
    process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";
/**
 * Sign a JWT token
 *
 * Used after user registration or login to issue a token
 *
 * @param payload - Payload to encode (e.g., { id, email, role })
 * @param expiresIn - Token expiry duration (default: 24h)
 * @returns Signed JWT token string
 * @throws ApiError - If signing fails
 */
const signJwt = (payload, expiresIn = JWT_EXPIRES_IN) => {
    try {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
    }
    catch (error) {
        throw new errors_1.ApiError(500, "Failed to sign JWT token");
    }
};
exports.signJwt = signJwt;
/**
 * Verify and decode a JWT token
 *
 * Used in authentication middleware to protect routes
 *
 * @param token - JWT token string to verify
 * @returns Decoded payload (JwtPayload)
 * @throws ApiError - If token is invalid, malformed, or expired
 */
const verifyJwt = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        // Token expired
        if (error.name === "TokenExpiredError") {
            throw new errors_1.ApiError(401, "Token has expired");
        }
        // Invalid token (signature, malformed, etc.)
        if (error.name === "JsonWebTokenError") {
            throw new errors_1.ApiError(401, "Invalid token");
        }
        // Generic JWT verification error
        throw new errors_1.ApiError(401, "Token verification failed");
    }
};
exports.verifyJwt = verifyJwt;
