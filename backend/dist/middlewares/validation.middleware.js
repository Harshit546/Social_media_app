"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateRequestBody = void 0;
const errors_1 = require("../utils/errors");
/**
 * Middleware to validate request body is not empty
 */
const validateRequestBody = (req, _res, next) => {
    try {
        if (req.method !== "GET" && req.method !== "DELETE") {
            if (!req.body || Object.keys(req.body).length === 0) {
                throw new errors_1.BadRequestError("Request body cannot be empty");
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateRequestBody = validateRequestBody;
/**
 * Middleware to validate request parameters
 */
const validateParams = (allowedParams) => {
    return (req, _res, next) => {
        try {
            const params = req.params;
            for (const param of allowedParams) {
                if (!params[param]) {
                    throw new errors_1.BadRequestError(`Missing required parameter: ${param}`);
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateParams = validateParams;
/**
 * Middleware to validate query parameters
 */
const validateQuery = (requiredParams) => {
    return (req, _res, next) => {
        try {
            const missing = requiredParams.filter(param => !req.query[param]);
            if (missing.length > 0) {
                throw new errors_1.BadRequestError(`Missing required query parameters: ${missing.join(", ")}`);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.validateQuery = validateQuery;
