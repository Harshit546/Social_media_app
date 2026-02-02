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

import Post, { IPost } from "../models/post.model";
import { Types } from "mongoose";
import fs from "fs";
import path from "path";
import {
    NotFoundError,
    ForbiddenError,
    DatabaseError,
    BadRequestError
} from "../utils/errors";

/**
 * Create a new post
 *
 * @param userId - ID of the authenticated user creating the post
 * @param content - Text content of the post
 * @returns Newly created post document
 */
export const createPost = async (
    userId: Types.ObjectId,
    content: string,
    thumbnailUrl?: string
): Promise<IPost> => {
    try {
        // Validate required inputs
        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        // Persist post in database
        const post = await Post.create({
            content,
            user: userId,
            thumbnail: thumbnailUrl || "",
        });

        return post;
    } catch (error: any) {
        // Re-throw known validation errors
        if (error instanceof BadRequestError) {
            throw error;
        }

        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }

        // Fallback for unexpected DB failures
        throw new DatabaseError("Failed to create post");
    }
};

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
export const getAllPosts = async (
    page: number = 1,
    limit: number = 5
): Promise<{ posts: IPost[]; total: number; pages: number }> => {
    try {
        // Normalize pagination inputs
        const pageNum = Math.max(1, page);
        const limitNum = 5; // Fixed page size for consistency
        const skip = (pageNum - 1) * limitNum;

        // Fetch posts and total count in parallel
        const [posts, total] = await Promise.all([
            Post.find({ isDeleted: false })
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

            Post.countDocuments({ isDeleted: false })
        ]);

        const pages = Math.ceil(total / limitNum);

        return { posts, total, pages };
    } catch (error: any) {
        throw new DatabaseError("Failed to retrieve posts");
    }
};

/**
 * Retrieve a single post by ID
 *
 * @param postId - ID of the post
 * @returns Post document
 * @throws BadRequestError if postId is invalid
 * @throws NotFoundError if post doesn't exist or is deleted
 * @throws DatabaseError for other database issues
 */
export const getPost = async (postId: string): Promise<IPost> => {
    try {
        // Validate postId format and type
        if (!postId || typeof postId !== "string") {
            throw new BadRequestError("Post ID must be a valid string");
        }

        if (!Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID format");
        }

        const post = await Post.findById(postId)
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
            throw new NotFoundError("Post");
        }

        if (post.isDeleted) {
            throw new NotFoundError("Post (deleted)");
        }

        return post;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        console.error("Error retrieving post:", error);
        throw new DatabaseError("Failed to retrieve post");
    }
};

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
export const updatePost = async (
    postId: string,
    userId: Types.ObjectId,
    content: string,
    thumbnailUrl?: string
): Promise<IPost> => {
    try {
        // Validate identifiers thoroughly
        if (!postId || typeof postId !== "string") {
            throw new BadRequestError("Post ID must be a valid string");
        }

        if (!Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID format");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required for authorization");
        }

        if (!content || typeof content !== "string") {
            throw new BadRequestError("Post content must be a valid string");
        }

        // Trim content to prevent whitespace-only updates
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) {
            throw new BadRequestError("Post content cannot be empty");
        }

        const post = await Post.findById(postId);

        // Ensure post exists and is not deleted
        if (!post) {
            throw new NotFoundError("Post");
        }

        if (post.isDeleted) {
            throw new NotFoundError("Post (already deleted)");
        }

        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only edit your own posts");
        }

        // Apply update with validation
        post.content = trimmedContent;

        // If a new thumbnail filename is provided and differs from current, attempt to remove the old file from disk to avoid orphaned files.
        if (thumbnailUrl !== undefined && thumbnailUrl !== null) {
            const newThumb = String(thumbnailUrl || "");
            const oldThumb = post.thumbnail || "";

            if (newThumb && oldThumb && newThumb !== oldThumb) {
                try {
                    const uploadsDir = path.join(__dirname, "../../uploads");
                    const oldPath = path.join(uploadsDir, oldThumb);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                } catch (delErr) {
                    // Log but don't fail the update just because cleanup failed
                    console.warn("Failed to remove old thumbnail:", delErr);
                }
            }

            post.thumbnail = newThumb;
        }

        const updatedPost = await post.save();
        return updatedPost;
    } catch (error: any) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof BadRequestError
        ) {
            throw error;
        }

        if (error.name === "ValidationError") {
            throw new BadRequestError(error.message);
        }

        throw new DatabaseError("Failed to update post");
    }
};

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
export const deletePost = async (
    postId: string,
    userId: Types.ObjectId
): Promise<void> => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);

        if (!post) {
            throw new NotFoundError("Post");
        }

        // Authorization check
        if (post.user.toString() !== userId.toString()) {
            throw new ForbiddenError("You can only delete your own posts");
        }

        // Soft delete instead of permanent removal
        post.isDeleted = true;
        await post.save();
    } catch (error: any) {
        if (
            error instanceof NotFoundError ||
            error instanceof ForbiddenError ||
            error instanceof BadRequestError
        ) {
            throw error;
        }

        throw new DatabaseError("Failed to delete post");
    }
};

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
export const toggleLike = async (
    postId: string,
    userId: Types.ObjectId
): Promise<IPost> => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);

        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        const alreadyLiked = post.likes.some(
            l => l.toString() === userId.toString()
        );

        // Toggle like
        if (alreadyLiked) {
            post.likes = post.likes.filter(
                l => l.toString() !== userId.toString()
            );
        } else {
            post.likes.push(new Types.ObjectId(userId));
        }

        const updated = await post.save();

        // Populate related fields for client response
        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);

        return updated;
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }

        throw new DatabaseError("Failed to toggle like");
    }
};

/**
 * Add a comment to a post
 *
 * @param postId - Target post ID
 * @param userId - Comment author ID
 * @param content - Comment text
 * @returns Updated post and newly added comment
 */
export const addComment = async (
    postId: string,
    userId: Types.ObjectId,
    content: string
) => {
    try {
        // Validate inputs
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        if (!content || typeof content !== "string") {
            throw new BadRequestError("Comment content is required");
        }

        const post = await Post.findById(postId);

        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        // Append embedded comment
        post.comments.push({ user: userId, content } as any);

        const updated = await post.save();

        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);

        // Return the newly created comment as well
        const newComment = updated.comments[updated.comments.length - 1];
        return { post: updated, comment: newComment };
    } catch (error: any) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }

        throw new DatabaseError("Failed to add comment");
    }
};

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
export const deleteComment = async (
    postId: string,
    commentId: string,
    userId: Types.ObjectId
) => {
    try {
        if (!postId || !Types.ObjectId.isValid(postId)) {
            throw new BadRequestError("Invalid post ID");
        }

        if (!commentId || !Types.ObjectId.isValid(commentId)) {
            throw new BadRequestError("Invalid comment ID");
        }

        if (!userId) {
            throw new BadRequestError("User ID is required");
        }

        const post = await Post.findById(postId);

        if (!post || post.isDeleted) {
            throw new NotFoundError("Post");
        }

        const comment = post.comments.find(
            c => c._id?.toString() === commentId
        );

        if (!comment) {
            throw new NotFoundError("Comment");
        }

        // Authorization logic
        const isCommentOwner =
            comment.user.toString() === userId.toString();
        const isPostOwner =
            post.user.toString() === userId.toString();

        if (!isCommentOwner && !isPostOwner) {
            throw new ForbiddenError(
                "You can only delete your own comment or comments on your post"
            );
        }

        // Remove comment
        post.comments = post.comments.filter(
            c => c._id?.toString() !== commentId
        );

        const updated = await post.save();

        await updated.populate([
            { path: "user", select: "email" },
            { path: "comments.user", select: "email" },
            { path: "likes", select: "email" }
        ]);

        return updated;
    } catch (error: any) {
        if (
            error instanceof NotFoundError ||
            error instanceof BadRequestError ||
            error instanceof ForbiddenError
        ) {
            throw error;
        }

        throw new DatabaseError("Failed to delete comment");
    }
};
