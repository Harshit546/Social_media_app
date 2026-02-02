/**
 * Password Hashing Utility Module
 * 
 * Provides secure password hashing and comparison using bcryptjs.
 * 
 * Security considerations:
 * - Uses 10 salt rounds for hashing
 * - Constant-time comparison to prevent timing attacks
 * - Plain text passwords are never stored
 */

import bcrypt from "bcryptjs";
import { DatabaseError } from "./errors";

/**
 * Hash a plain text password
 * 
 * Used during user registration before storing password in DB
 * 
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password string
 * @throws DatabaseError - If hashing fails
 */
export const hashPassword = async (password: string): Promise<string> => {
    try {
        if (!password) {
            throw new Error("Password is required");
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error: any) {
        throw new DatabaseError("Failed to hash password");
    }
};

/**
 * Compare plain text password with hashed password
 * 
 * Used during login to verify credentials
 * 
 * @param password - Plain text password input
 * @param hash - Hashed password stored in DB
 * @returns Promise<boolean> - True if passwords match
 * @throws DatabaseError - If comparison fails
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    try {
        if (!password || !hash) {
            throw new Error("Password and hash are required");
        }

        // bcrypt.compare handles constant-time comparison
        return await bcrypt.compare(password, hash);
    } catch (error: any) {
        throw new DatabaseError("Failed to compare passwords");
    }
};
