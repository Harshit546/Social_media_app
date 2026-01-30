"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseError = exports.BadRequestError = exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, validationErrors) {
        super(message);
        this.statusCode = statusCode;
        this.validationErrors = validationErrors;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
class ValidationError extends ApiError {
    constructor(message, validationErrors) {
        super(422, message, validationErrors);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends ApiError {
    constructor(resource) {
        super(404, `${resource} not found`);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApiError {
    constructor(message = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends ApiError {
    constructor(message) {
        super(409, message);
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends ApiError {
    constructor(message) {
        super(400, message);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class DatabaseError extends ApiError {
    constructor(message = "Database operation failed") {
        super(500, message);
        this.name = "DatabaseError";
    }
}
exports.DatabaseError = DatabaseError;
