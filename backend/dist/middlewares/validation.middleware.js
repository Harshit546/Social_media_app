"use strict";
/**
 * Request Validation Middleware
 *
 * Provides reusable middlewares to validate:
 * - Request body is not empty
 * - Required route parameters
 * - Required query parameters
 *
 * Throws BadRequestError for invalid requests.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateRequestBody = void 0;
const errors_1 = require("../utils/errors");
/**
 * Middleware to validate that request body is not empty.
 * Skips GET, DELETE, and PATCH requests (body optional for these methods).
 *
 * Usage:
 * router.post("/", validateRequestBody, controllerFunction);
 */
const validateRequestBody = (req, _res, next) => {
    try {
        // Only check methods where body is expected
        if (!["GET", "DELETE", "PATCH"].includes(req.method)) {
            // If request is multipart/form-data, multer will parse the body on the route.
            // Skip the empty-body check here so file uploads aren't rejected prematurely.
            const contentType = (req.headers['content-type'] || '').toString();
            if (contentType.includes('multipart/form-data')) {
                return next();
            }
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new errors_1.BadRequestError("Request body cannot be empty");
            }
        }
        next();
    }
    catch (error) {
        next(error); // Pass to central error handler
    }
};
exports.validateRequestBody = validateRequestBody;
/**
 * Middleware factory to validate required route parameters.
 *
 * @param allowedParams - Array of required param names
 * Usage:
 * router.get("/:id", validateParams(["id"]), controllerFunction);
 */
const validateParams = (allowedParams) => {
    return (req, _res, next) => {
        try {
            const missingParams = allowedParams.filter(param => !req.params[param]);
            if (missingParams.length > 0) {
                throw new errors_1.BadRequestError(`Missing required parameter(s): ${missingParams.join(", ")}`);
            }
            next();
        }
        catch (error) {
            next(error); // Pass to central error handler
        }
    };
};
exports.validateParams = validateParams;
/**
 * Middleware factory to validate required query parameters.
 *
 * @param requiredParams - Array of required query param names
 * Usage:
 * router.get("/search", validateQuery(["q"]), controllerFunction);
 */
const validateQuery = (requiredParams) => {
    return (req, _res, next) => {
        try {
            const missing = requiredParams.filter(param => req.query[param] === undefined);
            if (missing.length > 0) {
                throw new errors_1.BadRequestError(`Missing required query parameter(s): ${missing.join(", ")}`);
            }
            next();
        }
        catch (error) {
            next(error); // Pass to central error handler
        }
    };
};
exports.validateQuery = validateQuery;
