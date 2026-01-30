import { registerRules, loginRules, registerMessages, loginMessages } from "../validations/auth.schema";
import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service"
import { validateOrThrow } from "../utils/validator";
import { BadRequestError } from "../utils/errors";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BadRequestError("Request body cannot be empty");
        }

        validateOrThrow(req.body, registerRules, registerMessages);

        const result = await authService.registerUser(req.body.email, req.body.password);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: { user: result.user, token: result.token }
        });
    } catch (err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.body || Object.keys(req.body).length === 0) {
            throw new BadRequestError("Request body cannot be empty");
        }

        validateOrThrow(req.body, loginRules, loginMessages);

        const result = await authService.loginUser(req.body.email, req.body.password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: { user: result.user, token: result.token }
        });
    } catch (err) {
        next(err);
    }
}