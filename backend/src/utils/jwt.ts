import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET as string;

export const signJwt = (payload: object, expiresIn: string = "1h") => {
    return jwt.sign(payload, JWT_SECRET, {expiresIn});
}

export const verifyJwt = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}