import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errors";
import { verifyJwt } from "../utils/jwt";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or invalid authorization header");
        }

        const token = authHeader.split(" ")[1];
        
        if (!token) {
            throw new UnauthorizedError("Token not provided");
        }

        const payload = verifyJwt(token);

        if (!payload.id) {
            throw new UnauthorizedError("Invalid token payload");
        }

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
};