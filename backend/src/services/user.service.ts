import User from "../models/user.model";
import { ApiError } from "../utils/apiError";

export const softDeleteUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(401, "User not found");
    }

    user.isDeleted = true;
    await user.save();
}