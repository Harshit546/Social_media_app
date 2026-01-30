"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiError_1 = require("../utils/apiError");
const errorHandler = (err, _req, res, _next) => {
    let statusCode = 500;
    let message = "Internal server error";
    let errors;
    // Handle custom ApiError
    if (err instanceof apiError_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle validation errors from validatorjs
    else if (err.validationErrors) {
        statusCode = 422;
        message = "Validation failed";
        errors = err.validationErrors;
    }
    // Handle JSON parse errors
    else if (err instanceof SyntaxError && "body" in err) {
        statusCode = 400;
        message = "Invalid JSON in request body";
    }
    // Handle Mongoose/MongoDB errors
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
    // Handle Mongoose cast errors
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid ID format";
    }
    // Handle file upload errors (multer)
    else if (err.name === "MulterError") {
        statusCode = 400;
        if (err.code === "FILE_TOO_LARGE") {
            message = "File is too large";
        }
        else if (err.code === "LIMIT_FILE_COUNT") {
            message = "Too many files uploaded";
        }
        else {
            message = "File upload error";
        }
    }
    // Handle generic errors
    else if (err instanceof Error) {
        message = err.message;
    }
    const response = {
        success: false,
        message,
        statusCode,
        timestamp: new Date().toISOString()
    };
    if (errors) {
        response.errors = errors;
    }
    // Log error in development
    if (process.env.NODE_ENV === "development") {
        console.error({
            error: err,
            timestamp: new Date().toISOString()
        });
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
