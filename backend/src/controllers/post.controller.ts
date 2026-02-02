import { Request, Response, NextFunction } from "express";
import { createPostRules, updatePostRules, postMessages, commentRules, commentMessages } from "../validations/post.schema";
import * as postService from "../services/post.service";
import { validateOrThrow } from "../utils/validator";
import { ApiError, BadRequestError } from "../utils/errors";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        validateOrThrow(req.body, createPostRules, postMessages);

        if (!req.body.content || req.body.content.trim() === '') {
            throw new BadRequestError('Post content is required');
        }

        const post = await postService.createPost(req.user.id, req.body.content);

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract and validate pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        if (page < 1 || !Number.isInteger(page)) {
            throw new BadRequestError("Page must be a positive integer");
        }
        if (limit < 1 || !Number.isInteger(limit)) {
            throw new BadRequestError("Limit must be a positive integer");
        }
        if (limit > 100) {
            throw new BadRequestError("Limit cannot exceed 100 posts per page");
        }

        const { posts, total, pages } = await postService.getAllPosts(page, limit);

        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: posts,
            pagination: {
                currentPage: page,
                limit,
                total,
                totalPages: pages
            }
        });
    } catch (err) {
        next(err);
    }
};

export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!postId) {
            throw new BadRequestError("Post ID is required");
        }

        validateOrThrow(req.body, updatePostRules, postMessages);

        if (!req.body.content || req.body.content.trim() === '') {
            throw new BadRequestError('Post content is required');
        }

        const post = await postService.updatePost(postId, req.user.id, req.body.content);

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

export const deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

        if (!postId) {
            throw new BadRequestError("Post ID is required");
        }

        await postService.deletePost(postId, req.user.id);

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Toggle like on a post
     * - If user has already liked: remove like
     * - If user hasn't liked: add like
     * Route: PATCH /api/posts/:id/like
     * Authentication: Required (Bearer token)
     */
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId) throw new BadRequestError("Post ID is required");

        const post = await postService.toggleLike(postId, req.user.id);

        res.status(200).json({
            success: true,
            message: "Toggled like",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Add a comment to a post
     * Route: POST /api/posts/:id/comments
     * Body: { content: string }
     * Authentication: Required (Bearer token)
     */
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId) throw new BadRequestError("Post ID is required");

        validateOrThrow(req.body, commentRules, commentMessages);

        const result = await postService.addComment(postId, req.user.id, req.body.content);

        res.status(201).json({
            success: true,
            message: "Comment added",
            data: result.comment,
            post: result.post
        });
    } catch (err) {
        next(err);
    }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    /**
     * Delete a comment from a post
     * - Comment owner can delete their own comment
     * - Post owner can delete any comment on their post
     * Route: DELETE /api/posts/:id/comments/:commentId
     * Authentication: Required (Bearer token)
     */
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const commentId = Array.isArray(req.params.commentId) ? req.params.commentId[0] : req.params.commentId;

        if (!postId || !commentId) throw new BadRequestError("Post ID and Comment ID are required");

        const post = await postService.deleteComment(postId, commentId, req.user.id);

        res.status(204).json({
            success: true,
            message: "Comment deleted",
            data: post
        });
    } catch (err) {
        next(err);
    }
};