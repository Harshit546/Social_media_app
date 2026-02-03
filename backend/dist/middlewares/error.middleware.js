"use strict";
/**
 * Central Error Handling Middleware
 *
 * Catches and formats all errors occurring in the Express application.
 * Returns structured JSON responses with:
 * - success: false
 * - message: human-readable message
 * - statusCode: HTTP status code
 * - errors: optional detailed validation errors
 * - timestamp: ISO timestamp of error
 *
 * Handles:
 * - Custom ApiError (from errors.ts)
 * - ValidatorJS validation errors
 * - SyntaxError (invalid JSON)
 * - Mongoose/MongoDB errors
 * - Payload too large
 * - Duplicate key errors
 * - Generic JS errors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
/**
 * Express error-handling middleware
 * @param err - Error object caught by Express
 * @param _req - Express Request object
 * @param res - Express Response object
 * @param _next - Express NextFunction (not used)
 */
const errorHandler = (err, _req, res, _next) => {
    // Default values
    let statusCode = 500;
    let message = "Internal server error";
    let errors;
    // Handle custom API errors (from errors.ts)
    if (err instanceof errors_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        if (err.validationErrors) {
            errors = err.validationErrors;
        }
    }
    // Handle ValidatorJS validation errors
    else if (err.validationErrors) {
        statusCode = 422;
        message = "Validation failed";
        errors = err.validationErrors;
    }
    // Handle invalid JSON in request body
    else if (err instanceof SyntaxError && "body" in err) {
        statusCode = 400;
        message = "Invalid JSON in request body";
    }
    // Handle Mongoose or MongoDB errors
    else if (err.name === "MongooseError" || err.name === "MongoServerError") {
        statusCode = 500;
        message = "Database error occurred";
        if (process.env.NODE_ENV === "development") {
            errors = { details: err.message };
        }
    }
    // Handle Mongoose validation errors
    else if (err.name === "ValidationError") {
        statusCode = 422;
        message = "Data validation failed";
        errors = Object.entries(err.errors).reduce((acc, [key, value]) => {
            acc[key] = value.message;
            return acc;
        }, {});
    }
    // Handle Mongoose cast errors (invalid ObjectId)
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    // Handle request payload too large
    else if (err.type === "entity.too.large") {
        statusCode = 413;
        message = "Request payload too large";
    }
    // Handle MongoDB duplicate key errors
    else if (err.code === 11000) {
        statusCode = 409;
        message = "Duplicate entry";
        const field = Object.keys(err.keyValue || {})[0];
        if (field) {
            errors = { [field]: `${field} already exists` };
        }
    }
    // Handle generic JS errors
    else if (err instanceof Error) {
        message = err.message || message;
    }
    // Build structured error response
    const response = {
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString()
    };
    if (errors) {
        response.errors = errors;
    }
    // Log full error details in development
    if (process.env.NODE_ENV === "development") {
        console.error({
            error: err,
            timestamp: new Date().toISOString()
        });
    }
    // Send JSON response
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
