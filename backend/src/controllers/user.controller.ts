import { Request, Response, NextFunction } from "express";
import { softDeleteUser } from "../services/user.service";
import { ApiError } from "../utils/errors";

/**
 * Delete (soft delete) authenticated user's account.
 *
 * Flow:
 * - Ensure user is authenticated
 * - Call service layer to perform soft deletion
 * - Return success response
 *
 * Route: DELETE /api/users/me
 * Authentication: Required (Bearer token)
 */
export const deleteAccount = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Authentication guard
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        // Perform soft delete via service layer
        await softDeleteUser(req.user.id);

        // Respond with success (user is now marked as deleted)
        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (err) {
        // Delegate error handling to centralized error middleware
        next(err);
    }
};
