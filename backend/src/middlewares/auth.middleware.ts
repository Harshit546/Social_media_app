import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { verifyJwt } from "../utils/jwt";

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        throw new ApiError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyJwt(token);

    req.user = payload;
    next();
}