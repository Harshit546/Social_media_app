import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errors";

/**
 * Middleware to validate request body is not empty
 */
export const validateRequestBody = (req: Request, _res: Response, next: NextFunction) => {
    try {
        if (req.method !== "GET" && req.method !== "DELETE") {
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new BadRequestError("Request body cannot be empty");
            }
        }
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to validate request parameters
 */
export const validateParams = (allowedParams: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const params = req.params;
            for (const param of allowedParams) {
                if (!params[param]) {
                    throw new BadRequestError(`Missing required parameter: ${param}`);
                }
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to validate query parameters
 */
export const validateQuery = (requiredParams: string[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        try {
            const missing = requiredParams.filter(param => !req.query[param]);
            if (missing.length > 0) {
                throw new BadRequestError(`Missing required query parameters: ${missing.join(", ")}`);
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};
