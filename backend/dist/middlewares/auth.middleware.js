"use strict";
/**
 * Authentication Middleware
 *
 * Validates JWT tokens from Authorization header.
 * Extracts and attaches user data to Express request object.
 * Protects routes that require authentication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const errors_1 = require("../utils/errors");
const jwt_1 = require("../utils/jwt");
/**
 * Middleware to authenticate requests using JWT Bearer token
 *
 * Expected header format: Authorization: Bearer <token>
 * Attaches decoded user to req.user
 */
const authMiddleware = (req, _res, next) => {
    try {
        // 1. Check if Authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new errors_1.UnauthorizedError("Missing or invalid authorization header");
        }
        // 2. Extract token from header
        const token = authHeader.split(" ")[1].trim();
        if (!token) {
            throw new errors_1.UnauthorizedError("Token not provided");
        }
        // 3. Verify and decode token
        const payload = (0, jwt_1.verifyJwt)(token);
        // 4. Ensure payload contains user ID
        if (!payload.id) {
            throw new errors_1.UnauthorizedError("Invalid token payload");
        }
        // 5. Attach user data to request for downstream access
        req.user = payload;
        // 6. Proceed to next middleware/controller
        next();
    }
    catch (error) {
        // Pass all errors to central error handler
        next(error);
    }
};
exports.authMiddleware = authMiddleware;
