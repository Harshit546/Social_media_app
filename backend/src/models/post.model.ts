/**
 * Post Model
 *
 * Mongoose schema and model for the Post collection.
 * Represents social media posts created by users.
 *
 * Key design choices:
 * - Comments are embedded (not a separate collection) for fast reads.
 * - Likes are tracked via an array of User ObjectIds.
 * - Soft delete is implemented to preserve data relationships.
 * - Virtual fields expose computed counts without extra storage.
 */

import { model, Schema, Document, Types } from "mongoose";
/**
 * IPost
 * 
 * TypeScript interface representing a Post document.
 */
export interface IPost extends Document {
    user: Types.ObjectId;     // Author of the post (ref: User)
    content: string;          // Post text content
    isDeleted: boolean;       // Soft delete flag
    createdAt: Date;          // Creation timestamp
    updatedAt: Date;          // Last update timestamp
}

/**
 * postSchema
 * 
 * Schema definition for Post documents.
 *
 * Design considerations:
 * - Optimized for feed reads (single query fetch).
 * - Uses soft delete to retain analytics and moderation history.
 * - Likes stored as an array for fast existence checks.
 */
const postSchema = new Schema<IPost>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true // Post must belong to a user
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500 // Prevent spam/abuse
        },
        isDeleted: {
            type: Boolean,
            default: false // Soft delete flag
        }
    },
    {
        timestamps: true // Automatically adds createdAt & updatedAt
    }
);

// Add an index to support searching by content. // Using a text index allows more flexible matching; if you prefer regex-only, 
// you can also add a normal index on content for prefix searches. 

postSchema.index({ content: "text" }); 

// Example additional indexes used by queries 
postSchema.index({ isDeleted: 1, createdAt: -1 });

/**
 * Export Post model
 * 
 * Central Post model used throughout services and controllers.
 */
export default model<IPost>("Post", postSchema);
