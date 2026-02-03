"use strict";
/**
 * Post Service
 *
 * Contains business logic related to Post operations.
 * This layer is responsible for:
 * - Data validation beyond controllers
 * - Authorization checks
 * - Database interaction
 * - Error normalization
 *
 * Controllers should remain thin and delegate logic here.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.toggleLike = exports.deletePost = exports.updatePost = exports.getPost = exports.getAllPosts = exports.createPost = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const mongoose_1 = require("mongoose");
const errors_1 = require("../utils/errors");
const s3_1 = require("../utils/s3");
/**
 * Create a new post
 *
 * @param userId - ID of the authenticated user creating the post
 * @param content - Text content of the post
 * @returns Newly created post document
 */
const createPost = async (userId, content, thumbnailUrl) => {
    try {
        // Validate required inputs
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        // Persist post in database
        const post = await post_model_1.default.create({
            content,
            user: userId,
            thumbnail: thumbnailUrl || "",
        });
        return post;
    }
    catch (error) {
        // Re-throw known validation errors
        if (error instanceof errors_1.BadRequestError) {
            throw error;
        }
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        // Fallback for unexpected DB failures
        throw new errors_1.DatabaseError("Failed to create post");
    }
};
exports.createPost = createPost;
/**
 * Fetch paginated list of posts
 *
 * Notes:
 * - Excludes soft-deleted posts
 * - Populates user and comment author info
 * - Sorted newest-first (feed style)
 *
 * @param page - Current page number (1-based)
 * @param limit - Number of posts per page (fixed internally)
 * @returns Paginated posts with metadata
 */
const getAllPosts = async (page = 1, limit = 5) => {
    try {
        // Normalize pagination inputs
        const pageNum = Math.max(1, page);
        const limitNum = 5; // Fixed page size for consistency
        const skip = (pageNum - 1) * limitNum;
        // Fetch posts and total count in parallel
        const [posts, total] = await Promise.all([
            post_model_1.default.find({ isDeleted: false })
                .populate({
                path: "user",
                select: "email",
                match: { isDeleted: false }
            })
                .populate({
                path: "comments.user",
                select: "email"
            })
                .sort({ createdAt: -1 }) // Newest posts first
                .skip(skip)
                .limit(limitNum),
            post_model_1.default.countDocuments({ isDeleted: false })
        ]);
        const pages = Math.ceil(total / limitNum);
        return { posts, total, pages };
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to retrieve posts");
    }
};
exports.getAllPosts = getAllPosts;
/**
 * Retrieve a single post by ID
 *
 * @param postId - ID of the post
 * @returns Post document
 * @throws BadRequestError if postId is invalid
 * @throws NotFoundError if post doesn't exist or is deleted
 * @throws DatabaseError for other database issues
 */
const getPost = async (postId) => {
    try {
        // Validate postId format and type
        if (!postId || typeof postId !== "string") {
            throw new errors_1.BadRequestError("Post ID must be a valid string");
        }
        if (!mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID format");
        }
        const post = await post_model_1.default.findById(postId)
            .populate({
            path: "user",
            select: "email",
            match: { isDeleted: false }
        })
            .populate({
            path: "comments.user",
            select: "email"
        });
        if (!post) {
            throw new errors_1.NotFoundError("Post");
        }
        if (post.isDeleted) {
            throw new errors_1.NotFoundError("Post (deleted)");
        }
        return post;
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        console.error("Error retrieving post:", error);
        throw new errors_1.DatabaseError("Failed to retrieve post");
    }
};
exports.getPost = getPost;
/**
 * Update an existing post
 *
 * Authorization:
 * - Only the post owner can update
 *
 * @param postId - ID of the post to update
 * @param userId - ID of the authenticated user
 * @param content - Updated post content
 * @param thumbnailUrl - Optional new thumbnail filename
 * @returns Updated post document
 */
const updatePost = async (postId, userId, content, thumbnailUrl) => {
    try {
        // Validate identifiers thoroughly
        if (!postId || typeof postId !== "string") {
            throw new errors_1.BadRequestError("Post ID must be a valid string");
        }
        if (!mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID format");
        }
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required for authorization");
        }
        if (!content || typeof content !== "string") {
            throw new errors_1.BadRequestError("Post content must be a valid string");
        }
        // Trim content to prevent whitespace-only updates
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
            throw new errors_1.BadRequestError("Post content cannot be empty");
        }
        const post = await post_model_1.default.findById(postId);
        // Ensure post exists and is not deleted
        if (!post) {
            throw new errors_1.NotFoundError("Post");
        }
        if (post.isDeleted) {
            throw new errors_1.NotFoundError("Post (already deleted)");
        }
        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new errors_1.ForbiddenError("You can only edit your own posts");
        }
        // Apply update with validation
        post.content = trimmedContent;
        // If a new thumbnail URL is provided and differs from current, delete the old one from S3
        if (thumbnailUrl !== undefined && thumbnailUrl !== null) {
            const newThumb = String(thumbnailUrl || "");
            const oldThumb = post.thumbnail || "";
            if (newThumb && oldThumb && newThumb !== oldThumb) {
                try {
                    // Delete old thumbnail from S3
                    await (0, s3_1.deleteFromS3)(oldThumb);
                }
                catch (delErr) {
                    // Log but don't fail the update if S3 cleanup fails
                    console.warn("Failed to remove old thumbnail from S3:", delErr);
                }
            }
            post.thumbnail = newThumb;
        }
        const updatedPost = await post.save();
        return updatedPost;
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError ||
            error instanceof errors_1.ForbiddenError ||
            error instanceof errors_1.BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        throw new errors_1.DatabaseError("Failed to update post");
    }
};
exports.updatePost = updatePost;
/**
 * Soft delete a post
 *
 * Notes:
 * - Post is not physically removed
 * - Preserves relationships and moderation history
 *
 * Authorization:
 * - Only the post owner can delete
 *
 * @param postId - ID of the post
 * @param userId - ID of the authenticated user
 */
const deletePost = async (postId, userId) => {
    try {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID");
        }
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        const post = await post_model_1.default.findById(postId);
        if (!post) {
            throw new errors_1.NotFoundError("Post");
        }
        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new errors_1.ForbiddenError("You can only delete your own posts");
        }
        // Delete thumbnail from S3 if it exists
        if (post.thumbnail) {
            try {
                await (0, s3_1.deleteFromS3)(post.thumbnail);
            }
            catch (delErr) {
                // Log but don't fail the delete if S3 cleanup fails
                console.warn("Failed to remove thumbnail from S3:", delErr);
            }
        }
        // Soft delete instead of permanent removal
        post.isDeleted = true;
        await post.save();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError ||
            error instanceof errors_1.ForbiddenError ||
            error instanceof errors_1.BadRequestError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Failed to delete post");
    }
};
exports.deletePost = deletePost;
/**
 * Toggle like on a post
 *
 * Behavior:
 * - If user already liked → unlike
 * - If not liked → add like
 *
 * @param postId - Target post ID
 * @param userId - Authenticated user ID
 * @returns Updated post document
 */
const toggleLike = async (postId, userId) => {
    try {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID");
        }
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        const post = await post_model_1.default.findById(postId);
        if (!post || post.isDeleted) {
            throw new errors_1.NotFoundError("Post");
        }
        const alreadyLiked = post.likes.some(l => l.toString() === userId.toString());
        // Toggle like
        if (alreadyLiked) {
            post.likes = post.likes.filter(l => l.toString() !== userId.toString());
        }
        else {
            post.likes.push(new mongoose_1.Types.ObjectId(userId));
        }
        const updated = await post.save();
        // Populate related fields for client response
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        return updated;
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Failed to toggle like");
    }
};
exports.toggleLike = toggleLike;
/**
 * Add a comment to a post
 *
 * @param postId - Target post ID
 * @param userId - Comment author ID
 * @param content - Comment text
 * @returns Updated post and newly added comment
 */
const addComment = async (postId, userId, content) => {
    try {
        // Validate inputs
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID");
        }
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        if (!content || typeof content !== "string") {
            throw new errors_1.BadRequestError("Comment content is required");
        }
        const post = await post_model_1.default.findById(postId);
        if (!post || post.isDeleted) {
            throw new errors_1.NotFoundError("Post");
        }
        // Append embedded comment
        post.comments.push({ user: userId, content });
        const updated = await post.save();
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        // Return the newly created comment as well
        const newComment = updated.comments[updated.comments.length - 1];
        return { post: updated, comment: newComment };
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Failed to add comment");
    }
};
exports.addComment = addComment;
/**
 * Delete a comment from a post
 *
 * Authorization:
 * - Comment owner OR post owner may delete
 *
 * @param postId - Parent post ID
 * @param commentId - Comment ID
 * @param userId - Authenticated user ID
 * @returns Updated post document
 */
const deleteComment = async (postId, commentId, userId) => {
    try {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new errors_1.BadRequestError("Invalid post ID");
        }
        if (!commentId || !mongoose_1.Types.ObjectId.isValid(commentId)) {
            throw new errors_1.BadRequestError("Invalid comment ID");
        }
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        const post = await post_model_1.default.findById(postId);
        if (!post || post.isDeleted) {
            throw new errors_1.NotFoundError("Post");
        }
        const comment = post.comments.find(c => c._id?.toString() === commentId);
        if (!comment) {
            throw new errors_1.NotFoundError("Comment");
        }
        // Authorization logic
        const isCommentOwner = comment.user.toString() === userId.toString();
        const isPostOwner = post.user.toString() === userId.toString();
        if (!isCommentOwner && !isPostOwner) {
            throw new errors_1.ForbiddenError("You can only delete your own comment or comments on your post");
        }
        // Remove comment
        post.comments = post.comments.filter(c => c._id?.toString() !== commentId);
        const updated = await post.save();
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);
        return updated;
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError ||
            error instanceof errors_1.BadRequestError ||
            error instanceof errors_1.ForbiddenError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Failed to delete comment");
    }
};
exports.deleteComment = deleteComment;
