export class ApiError extends Error {
    statusCode: number;
    validationErrors?: Record<string, any>;

    constructor(statusCode: number, message: string, validationErrors?: Record<string, any>) {
        super(message);
        this.statusCode = statusCode;
        this.validationErrors = validationErrors;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends ApiError {
    constructor(message: string, validationErrors: Record<string, any>) {
        super(422, message, validationErrors);
        this.name = "ValidationError";
    }
}

export class NotFoundError extends ApiError {
    constructor(resource: string) {
        super(404, `${resource} not found`);
        this.name = "NotFoundError";
    }
}

export class UnauthorizedError extends ApiError {
    constructor(message: string = "Unauthorized") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = "Forbidden") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}

export class ConflictError extends ApiError {
    constructor(message: string) {
        super(409, message);
        this.name = "ConflictError";
    }
}

export class BadRequestError extends ApiError {
    constructor(message: string) {
        super(400, message);
        this.name = "BadRequestError";
    }
}

export class DatabaseError extends ApiError {
    constructor(message: string = "Database operation failed") {
        super(500, message);
        this.name = "DatabaseError";
    }
}
