/**
 * Authentication Middleware
 * 
 * Validates JWT tokens from Authorization header.
 * Extracts and attaches user data to Express request object.
 * Protects routes that require authentication.
 */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import { verifyJwt } from "../utils/jwt";

/**
 * Authenticated user payload interface
 * Extend if you store additional info in JWT
 */
interface AuthPayload {
    id: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
}

/**
 * Middleware to authenticate requests using JWT Bearer token
 * 
 * Expected header format: Authorization: Bearer <token>
 * Attaches decoded user to req.user
 */
export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    try {
        // 1. Check if Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or invalid authorization header");
        }

        // 2. Extract token from header
        const token = authHeader.split(" ")[1].trim();
        if (!token) {
            throw new UnauthorizedError("Token not provided");
        }

        // 3. Verify and decode token
        const payload = verifyJwt(token) as AuthPayload;

        // 4. Ensure payload contains user ID
        if (!payload.id) {
            throw new UnauthorizedError("Invalid token payload");
        }

        // 5. Attach user data to request for downstream access
        req.user = payload;

        // 6. Proceed to next middleware/controller
        next();
    } catch (error) {
        // Pass all errors to central error handler
        next(error);
    }
};
