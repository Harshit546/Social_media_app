import jwt, { JwtPayload } from "jsonwebtoken"
import { ApiError } from "./apiError";

const JWT_SECRET: string = process.env.JWT_SECRET || "your-secret-key";

if (!process.env.JWT_SECRET) {
    console.warn("JWT_SECRET environment variable is not set, using default");
}

export const signJwt = (payload: object, expiresIn: string = "1h"): string => {
    try {
        return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
    } catch (error) {
        throw new ApiError(500, "Failed to sign JWT token");
    }
};

export const verifyJwt = (token: string): JwtPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error: any) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Token has expired");
        }
        if (error.name === "JsonWebTokenError") {
            throw new ApiError(401, "Invalid token");
        }
        throw new ApiError(401, "Token verification failed");
    }
};;