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

import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

/**
 * Middleware to validate that request body is not empty.
 * Skips GET, DELETE, and PATCH requests (body optional for these methods).
 * 
 * Usage:
 * router.post("/", validateRequestBody, controllerFunction);
 */
export const validateRequestBody = (req: Request, _res: Response, next: NextFunction) => {
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
                throw new BadRequestError("Request body cannot be empty");
            }
        }
        next();
    } catch (error) {
        next(error); // Pass to central error handler
    }
};

/**
 * Middleware factory to validate required route parameters.
 * 
 * @param allowedParams - Array of required param names
 * Usage:
 * router.get("/:id", validateParams(["id"]), controllerFunction);
 */
export const validateParams = (allowedParams: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const missingParams = allowedParams.filter(param => !req.params[param]);
            if (missingParams.length > 0) {
                throw new BadRequestError(`Missing required parameter(s): ${missingParams.join(", ")}`);
            }
            next();
        } catch (error) {
            next(error); // Pass to central error handler
        }
    };
};

/**
 * Middleware factory to validate required query parameters.
 * 
 * @param requiredParams - Array of required query param names
 * Usage:
 * router.get("/search", validateQuery(["q"]), controllerFunction);
 */
export const validateQuery = (requiredParams: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const missing = requiredParams.filter(param => req.query[param] === undefined);
            if (missing.length > 0) {
                throw new BadRequestError(`Missing required query parameter(s): ${missing.join(", ")}`);
            }
            next();
        } catch (error) {
            next(error); // Pass to central error handler
        }
    };
};
