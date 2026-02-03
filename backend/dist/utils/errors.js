"use strict";
/**
 * Centralized API Error Classes
 *
 * Provides a hierarchy of custom errors for consistent error handling:
 * - All errors extend ApiError, which includes HTTP status codes
 * - Optional validationErrors object for detailed field-level errors
 * - Helps controllers and middleware respond consistently
 *
 * Usage:
 * throw new NotFoundError("Post not found");
 * throw new ValidationError("Invalid input", { email: ["Email is required"] });
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.BadRequestError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.ApiError = void 0;
// Base API error class
class ApiError extends Error {
    /**
     * @param statusCode - HTTP status code
     * @param message - Error message
     * @param validationErrors - Optional object containing validation errors
     */
    constructor(statusCode, message, validationErrors) {
        super(message);
        this.statusCode = statusCode;
        this.validationErrors = validationErrors;
        Error.captureStackTrace(this, this.constructor); // Exclude constructor from stack trace
    }
}
exports.ApiError = ApiError;
// 422 Unprocessable Entity - validation errors
class ValidationError extends ApiError {
    constructor(message, validationErrors) {
        super(422, message, validationErrors);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
// 404 Not Found - resource not found
class NotFoundError extends ApiError {
    constructor(resource) {
        super(404, `${resource} not found`);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
// 401 Unauthorized - user not authenticated
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
// 403 Forbidden - user authenticated but not allowed
class ForbiddenError extends ApiError {
    constructor(message = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
// 409 Conflict - duplicate resource or state conflict
class ConflictError extends ApiError {
    constructor(message) {
        super(409, message);
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
// 400 Bad Request - invalid input or missing parameters
class BadRequestError extends ApiError {
    constructor(message) {
        super(400, message);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
// 500 Internal Server Error - database or server operation failure
class DatabaseError extends ApiError {
    constructor(message = "Database operation failed") {
        super(500, message);
        this.name = "DatabaseError";
    }
}
exports.DatabaseError = DatabaseError;
