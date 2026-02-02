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

import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "./errors";

// Fail fast if JWT_SECRET not provided
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is not set");
    console.error("Please create a .env file with JWT_SECRET=your_secret_key");
    process.exit(1);
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "24h";

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
export const signJwt = (payload: object, expiresIn: string = JWT_EXPIRES_IN): string => {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
    } catch (error) {
        throw new ApiError(500, "Failed to sign JWT token");
    }
};

/**
 * Verify and decode a JWT token
 * 
 * Used in authentication middleware to protect routes
 * 
 * @param token - JWT token string to verify
 * @returns Decoded payload (JwtPayload)
 * @throws ApiError - If token is invalid, malformed, or expired
 */
export const verifyJwt = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error: any) {
        // Token expired
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token has expired");
        }
        // Invalid token (signature, malformed, etc.)
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid token");
        }
        // Generic JWT verification error
        throw new ApiError(401, "Token verification failed");
    }
};
