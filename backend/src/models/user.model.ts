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

import { model, Schema, Document } from "mongoose";

/**
 * IUser
 * 
 * TypeScript interface representing a User document in MongoDB.
 * Extends Mongoose's Document to include default document properties.
 */
export interface IUser extends Document {
    email: string;        // Unique user email address (used as login identifier)
    password: string;     // Hashed password (never store plaintext passwords)
    role: string;         // Authorization role (e.g., "user", "admin")
    isDeleted: boolean;   // Soft-delete flag for account deactivation
}

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
const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true, // Ensures no two users can register with the same email
            trim: true,   // Removes accidental leading/trailing whitespace
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
        isDeleted: {
            type: Boolean,
            default: false // Indicates whether the account is soft-deleted
        }
    },
    {
        timestamps: true // Automatically manages createdAt & updatedAt fields
    }
);

/**
 * Export User model
 * 
 * Centralized User model used across services, controllers, and middleware.
 */
export default model<IUser>("User", userSchema);
