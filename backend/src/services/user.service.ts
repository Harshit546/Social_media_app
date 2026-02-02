import User from "../models/user.model";
import { NotFoundError, DatabaseError, BadRequestError } from "../utils/errors";

/**
 * Soft delete a user account.
 *
 * This does NOT remove the user document from the database.
 * Instead, it marks the user as deleted so that:
 * - User data can be retained for audit / recovery
 * - Referential integrity with posts, comments, likes remains intact
 *
 * @param userId - Authenticated user's unique identifier
 * @throws BadRequestError - If userId is missing or invalid
 * @throws NotFoundError - If user does not exist
 * @throws DatabaseError - For any unexpected database failure
 */
export const softDeleteUser = async (userId: string): Promise<void> => {
    try {
        // Validate input early to avoid unnecessary DB calls
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        // Fetch user by ID
        const user = await User.findById(userId);

        // If user is not found, throw a domain-specific error
        if (!user) {
            throw new NotFoundError("User not found");
        }

        // Soft delete: mark user as deleted instead of removing record
        user.isDeleted = true;

        // Persist changes
        await user.save();
    } catch (error: any) {
        // Re-throw known, intentional errors
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }

        // Handle mongoose validation errors explicitly
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }

        // Fallback for unknown database errors
        throw new DatabaseError("Failed to delete user account");
    }
};
