import User, { IUser } from "../models/user.model"
import { hashPassword, comparePassword } from "../utils/hash"
import { signJwt } from "../utils/jwt"
import { ConflictError, UnauthorizedError, BadRequestError, DatabaseError } from "../utils/errors"

export const registerUser = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
    try {
        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        const isExisting = await User.findOne({ email });

        if (isExisting) {
            throw new ConflictError("User with this email already exists");
        }

        const hashed = await hashPassword(password);
        const user = await User.create({ email, password: hashed });

        const token = signJwt({ id: user._id, email: user.email, role: user.role });

        return { user, token };
    } catch (error: any) {
        if (error instanceof ConflictError || error instanceof BadRequestError) {
            throw error;
        }
        if (error.code === 11000) {
            throw new ConflictError("Email already registered");
        }
        throw new DatabaseError("Failed to register user");
    }
};

export const loginUser = async (email: string, password: string): Promise<{ user: IUser; token: string }> => {
    try {
        if (!email || !password) {
            throw new BadRequestError("Email and password are required");
        }

        const user = await User.findOne({ email });

        if (!user || user.isDeleted) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const token = signJwt({ id: user._id, email: user.email, role: user.role });

        return { user, token };
    } catch (error: any) {
        if (error instanceof UnauthorizedError || error instanceof BadRequestError) {
            throw error;
        }
        throw new DatabaseError("Login failed");
    }
};