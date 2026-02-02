/**
 * Authentication Controller
 *
 * Handles HTTP request/response lifecycle for authentication endpoints.
 *
 * Responsibilities:
 * - Validate incoming request payloads
 * - Delegate authentication logic to authService
 * - Send standardized API responses
 * - Forward errors to centralized error handler
*/

import { Request, Response, NextFunction } from "express";
import {
    registerRules,
    loginRules,
    registerMessages,
    loginMessages
} from "../validations/auth.schema";
import * as authService from "../services/auth.service";
import { validateOrThrow } from "../utils/validator";
import { BadRequestError } from "../utils/errors";

/**
 * Register a new user
 *
 * Endpoint: POST /api/auth/register
 *
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Ensure request body is present
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BadRequestError("Request body cannot be empty");
        }

        // Validate request payload against schema
        validateOrThrow(req.body, registerRules, registerMessages);

        // Delegate user creation to service layer
        const result = await authService.registerUser(
            req.body.email,
            req.body.password
        );

        // Send success response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (err) {
        // Forward error to centralized error handler
        next(err);
    }
};

/**
 * Login an existing user
 *
 * Endpoint: POST /api/auth/login
 *
 * Request Body:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction
 */
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Ensure request body is present
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BadRequestError("Request body cannot be empty");
        }

        // Validate request payload against schema
        validateOrThrow(req.body, loginRules, loginMessages);

        // Authenticate user via service layer
        const result = await authService.loginUser(
            req.body.email,
            req.body.password
        );

        // Send success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                user: result.user,
                token: result.token
            }
        });
    } catch (err) {
        // Forward error to centralized error handler
        next(err);
    }
};
