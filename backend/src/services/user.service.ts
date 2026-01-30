import User from "../models/user.model";
import { NotFoundError, DatabaseError, BadRequestError } from "../utils/errors";

export const softDeleteUser = async (userId: string): Promise<void> => {
    try {
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const user = await User.findById(userId);

        if (!user) {
            throw new NotFoundError("User");
        }

        user.isDeleted = true;
        await user.save();
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }
        throw new DatabaseError("Failed to delete user account");
    }
};