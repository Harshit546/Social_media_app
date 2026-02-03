"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * commentSchema
 *
 * Embedded schema for post comments.
 *
 * Configuration:
 * - Only `createdAt` is stored (comments are immutable after creation).
 * - No `updatedAt` to reduce unnecessary writes.
 */
const commentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true // Each comment must have an author
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500 // Prevent excessively long comments
    }
}, {
    timestamps: {
        createdAt: true,
        updatedAt: false
    }
});
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
const postSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true // Post must belong to a user
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxLength: 500 // Prevent spam/abuse
    },
    likes: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
            default: [] // Stores users who liked the post
        }
    ],
    comments: {
        type: [commentSchema],
        default: [] // Embedded comments for fast retrieval
    },
    thumbnail: { type: String, default: "" },
    isDeleted: {
        type: Boolean,
        default: false // Soft delete flag
    }
}, {
    timestamps: true // Automatically adds createdAt & updatedAt
});
/**
 * Virtual: likesCount
 *
 * Returns total number of likes without storing redundant data.
 */
postSchema.virtual("likesCount").get(function () {
    return this.likes ? this.likes.length : 0;
});
/**
 * Virtual: commentsCount
 *
 * Returns total number of comments.
 */
postSchema.virtual("commentsCount").get(function () {
    return this.comments ? this.comments.length : 0;
});
/**
 * Ensure virtual fields are included when converting documents to JSON or plain objects.
 */
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });
/**
 * Export Post model
 *
 * Central Post model used throughout services and controllers.
 */
exports.default = (0, mongoose_1.model)("Post", postSchema);
