"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
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
const softDeleteUser = async (userId) => {
    try {
        // Validate input early to avoid unnecessary DB calls
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        // Fetch user by ID
        const user = await user_model_1.default.findById(userId);
        // If user is not found, throw a domain-specific error
        if (!user) {
            throw new errors_1.NotFoundError("User not found");
        }
        // Soft delete: mark user as deleted instead of removing record
        user.isDeleted = true;
        // Persist changes
        await user.save();
    }
    catch (error) {
        // Re-throw known, intentional errors
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        // Handle mongoose validation errors explicitly
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        // Fallback for unknown database errors
        throw new errors_1.DatabaseError("Failed to delete user account");
    }
};
exports.softDeleteUser = softDeleteUser;
