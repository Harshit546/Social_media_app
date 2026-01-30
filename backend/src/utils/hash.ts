import bcrypt from "bcryptjs"
import { DatabaseError } from "./errors";

export const hashPassword = async (password: string): Promise<string> => {
    try {
        if (!password) {
            throw new Error("Password is required");
        }
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error: any) {
        throw new DatabaseError("Failed to hash password");
    }
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        if (!password || !hash) {
            throw new Error("Password and hash are required");
        }
        return await bcrypt.compare(password, hash);
    } catch (error: any) {
        throw new DatabaseError("Failed to compare passwords");
    }
};