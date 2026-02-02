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

// Base API error class
export class ApiError extends Error {
    statusCode: number;                   // HTTP status code (e.g., 400, 404, 500)
    validationErrors?: Record<string, any>; // Optional field-level validation errors

    /**
     * @param statusCode - HTTP status code
     * @param message - Error message
     * @param validationErrors - Optional object containing validation errors
     */
    constructor(statusCode: number, message: string, validationErrors?: Record<string, any>) {
        super(message);
        this.statusCode = statusCode;
        this.validationErrors = validationErrors;
        Error.captureStackTrace(this, this.constructor); // Exclude constructor from stack trace
    }
}

// 422 Unprocessable Entity - validation errors
export class ValidationError extends ApiError {
    constructor(message: string, validationErrors: Record<string, any>) {
        super(422, message, validationErrors);
        this.name = "ValidationError";
    }
}

// 404 Not Found - resource not found
export class NotFoundError extends ApiError {
    constructor(resource: string) {
        super(404, `${resource} not found`);
        this.name = "NotFoundError";
    }
}

// 401 Unauthorized - user not authenticated
export class UnauthorizedError extends ApiError {
    constructor(message: string = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}

// 403 Forbidden - user authenticated but not allowed
export class ForbiddenError extends ApiError {
    constructor(message: string = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}

// 409 Conflict - duplicate resource or state conflict
export class ConflictError extends ApiError {
    constructor(message: string) {
        super(409, message);
        this.name = "ConflictError";
    }
}

// 400 Bad Request - invalid input or missing parameters
export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(400, message);
        this.name = "BadRequestError";
    }
}

// 500 Internal Server Error - database or server operation failure
export class DatabaseError extends ApiError {
    constructor(message: string = "Database operation failed") {
        super(500, message);
        this.name = "DatabaseError";
    }
}
