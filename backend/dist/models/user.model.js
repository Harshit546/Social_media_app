"use strict";
/**
 * User Model
 *
 * Mongoose schema and model definition for the User collection.
 * This model represents application users and stores:
 *  - Authentication credentials
 *  - Authorization role
 *  - Soft-deletion state
 *
 * NOTE:
 * - Passwords must ALWAYS be stored in hashed form.
 * - This model intentionally avoids storing profile or social data to keep authentication concerns isolated.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * userSchema
 *
 * Schema definition for User documents.
 *
 * Design decisions:
 * - Uses email as the primary unique identifier.
 * - Implements soft delete via `isDeleted` instead of hard deletion to preserve data integrity and relationships.
 * - Uses timestamps to support auditing and analytics.
 */
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true, // Ensures no two users can register with the same email
        trim: true, // Removes accidental leading/trailing whitespace
        lowercase: true // Normalizes email storage for consistency
    },
    password: {
        type: String,
        required: true // Must be hashed before saving to the database
    },
    role: {
        type: String,
        default: "user" // Default role assigned at registration
    },
    avatar: {
        type: String,
        default: "", // S3 image URL
    },
    isDeleted: {
        type: Boolean,
        default: false // Indicates whether the account is soft-deleted
    }
}, {
    timestamps: true // Automatically manages createdAt & updatedAt fields
});
/**
 * Export User model
 *
 * Centralized User model used across services, controllers, and middleware.
 */
exports.default = (0, mongoose_1.model)("User", userSchema);
