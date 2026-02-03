"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = void 0;
const user_service_1 = require("../services/user.service");
const errors_1 = require("../utils/errors");
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
const deleteAccount = async (req, res, next) => {
    try {
        // Authentication guard
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        // Perform soft delete via service layer
        await (0, user_service_1.softDeleteUser)(req.user.id);
        // Respond with success (user is now marked as deleted)
        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    }
    catch (err) {
        // Delegate error handling to centralized error middleware
        next(err);
    }
};
exports.deleteAccount = deleteAccount;
