import { registerSchema, loginSchema } from "../validations/auth.schema";
import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service"

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = registerSchema.parse(req.body);

        const result = await authService.registerUser(validated.email, validated.password);

        res.status(201).json({user: result.user, token: result.token});
    }
    catch(err) {
        next(err);
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validated = loginSchema.parse(req.body);

        const result = await authService.loginUser(validated.email, validated.password);

        res.status(200).json({user: result.user, token: result.token});
    }
    catch(err) {
        next(err);
    }
}