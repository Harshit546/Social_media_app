import User, {IUser} from "../models/user.model"
import { hashPassword, comparePassword } from "../utils/hash"
import { signJwt } from "../utils/jwt"
import { ApiError } from "../utils/apiError"

export const registerUser = async (email: string, password: string): Promise<{user: IUser, token: string}> => {
    const isExisting = await User.findOne({email});

    if (isExisting) {
        throw new Error("User already exists");
    }

    const hashed = await hashPassword(password);
    const user = await User.create({email, password: hashed});

    const token = signJwt({id: user._id, email: user.email, role: user.role});

    return {user, token};
}

export const loginUser = async (email: string, password: string): Promise<{user: IUser, token: string}> => {
    const user = await User.findOne({email});

    if (!user || user.isDeleted) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }

    const token = signJwt({id: user._id, email: user.email, role: user.role});

    return {user, token};
}