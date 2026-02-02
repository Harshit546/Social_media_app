/**
 * Authentication Service
 *
 * Contains business logic for user authentication.
 * Responsibilities:
 * - User registration
 * - User login
 * - Password hashing & verification
 * - JWT generation
 *
 * Controllers should remain thin and delegate auth logic here.
 */

import User, { IUser } from "../models/user.model";
import { hashPassword, comparePassword } from "../utils/hash";
import { signJwt } from "../utils/jwt";
import {
    ConflictError,
    UnauthorizedError,
    BadRequestError,
    DatabaseError
} from "../utils/errors";

/**
 * Register a new user or reactivate a soft-deleted account
 *
 * Flow:
 * 1. Validate required inputs
 * 2. Check for existing active user
 * 3. If email exists but is soft-deleted, reactivate and update password
 * 4. If email is new, hash password and create new user
 * 5. Generate JWT for immediate authentication
 *
 * Benefits:
 * - Allows users to re-register the same email after account deletion
 * - Preserves user history and relationships in the database
 *
 * @param email - User email
 * @param password - Plain text password (hashed before storage)
 * @returns User record (newly created or reactivated) and authentication token
 */
export const registerUser = async (
    email: string,
    password: string
): Promise<{ user: IUser; token: string }> => {
    try {
        // Validate input
        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        // Check for active user with this email
        const activeUser = await User.findOne({ email, isDeleted: false });
        if (activeUser) {
            throw new ConflictError("Email is already in use by an active account");
        }

        // Check for soft-deleted user with this email (to reactivate)
        const deletedUser = await User.findOne({ email, isDeleted: true });

        // Hash password before saving
        const hashed = await hashPassword(password);

        let user: IUser;

        if (deletedUser) {
            // Reactivate the soft-deleted account with new password
            deletedUser.password = hashed;
            deletedUser.isDeleted = false;
            user = await deletedUser.save();
        } else {
            // Create brand new user
            user = await User.create({
                email,
                password: hashed
            });
        }

        // Generate JWT for authentication
        const token = signJwt({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return { user, token };
    } catch (error: any) {
        // Known domain errors
        if (error instanceof ConflictError || error instanceof BadRequestError) {
            throw error;
        }

        // Handle MongoDB unique constraint race condition
        if (error.code === 11000) {
            throw new ConflictError("Email already in use");
        }

        // Unexpected database failure
        throw new DatabaseError("Failed to register user");
    }
};

/**
 * Authenticate an existing user
 *
 * Flow:
 * 1. Validate input
 * 2. Fetch user by email
 * 3. Reject deleted accounts
 * 4. Compare hashed passwords
 * 5. Issue JWT on success
 *
 * @param email - User email
 * @param password - Plain text password
 * @returns Authenticated user and JWT token
 */
export const loginUser = async (
    email: string,
    password: string
): Promise<{ user: IUser; token: string }> => {
    try {
        // Validate input
        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        // Retrieve user by email
        const user = await User.findOne({ email });

        // Reject invalid or soft-deleted accounts
        if (!user || user.isDeleted) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // Compare password hashes
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedError("Invalid email or password");
        }

        // Generate authentication token
        const token = signJwt({
            id: user._id,
            email: user.email,
            role: user.role
        });

        return { user, token };
    } catch (error: any) {
        // Known authentication errors
        if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
            throw error;
        }

        // Unexpected database / infrastructure failure
        throw new DatabaseError("Login failed");
    }
};
