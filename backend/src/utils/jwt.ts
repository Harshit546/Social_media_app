import jwt, { JwtPayload } from "jsonwebtoken"
import { ApiError } from "./errors";

// Require JWT_SECRET - fail if not set
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET environment variable is not set");
    console.error("Please create a .env file with JWT_SECRET=your_secret_key");
    process.exit(1);
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "24h";

export const signJwt = (payload: object, expiresIn: string = JWT_EXPIRES_IN): string => {
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