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

import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors";
import ErrorLog from "../models/errorLog.model";

// Response format interface
interface ErrorResponse {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, any>; // Optional field for validation or detailed errors
    timestamp: string;
}

/**
 * Express error-handling middleware
 * @param err - Error object caught by Express
 * @param _req - Express Request object
 * @param res - Express Response object
 * @param _next - Express NextFunction (not used)
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    // Default values
    let statusCode = 500;
    let message = "Internal server error";
    let errors: Record<string, any> | undefined;

    // Handle custom API errors (from errors.ts)
    if (err instanceof ApiError) {
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
        errors = Object.entries(err.errors).reduce(
            (acc, [key, value]: any) => {
                acc[key] = value.message;
                return acc;
            },
            {} as Record<string, any>
        );
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

    const timestamp = new Date();

    // Fire-and-forget: persist error log to DB without blocking response
    (async () => {
        try {
            await ErrorLog.create({
                apiName: req.originalUrl,
                service: "backend",
                errorDetail: {
                    name: err?.name,
                    message: err?.message,
                    stack: err?.stack,
                    raw: err,
                },
                userId: (req as any).user?.id ?? null,
                errorOccurredTime: timestamp,
            });
        } catch (logErr) {
            if (process.env.NODE_ENV === "development") {
                console.error("Failed to write error log:", logErr);
            }
        }
    })();

    // Build structured error response
    const response: ErrorResponse = {
        success: false,
        message,
        statusCode,
        timestamp: timestamp.toISOString()
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
