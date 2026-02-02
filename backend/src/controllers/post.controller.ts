import { Request, Response, NextFunction } from "express";
import {
    createPostRules,
    updatePostRules,
    postMessages,
    commentRules,
    commentMessages
} from "../validations/post.schema";
import * as postService from "../services/post.service";
import { validateOrThrow } from "../utils/validator";
import { ApiError, BadRequestError } from "../utils/errors";

/**
 * Create a new post for the authenticated user.
 *
 * Route: POST /api/posts
 * Body: { content: string }
 * Authentication: Required
 */
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ensure request is authenticated
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        // Validate request body against schema
        validateOrThrow(req.body, createPostRules, postMessages);

        const content = req.body.content;

        // Handle optional thumbnail: store only filename, frontend will build full URL
        let thumbnailUrl = "";
        if (req.file) {
            thumbnailUrl = req.file.filename;
        }

        // Extra safeguard for empty or whitespace-only content
        if (!req.body.content || req.body.content.trim() === '') {
            throw new BadRequestError('Post content is required');
        }

        // Delegate post creation to service layer
        const post = await postService.createPost(req.user.id, content, thumbnailUrl);

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Retrieve paginated list of posts.
 *
 * Route: GET /api/posts
 * Query params:
 * - page (default: 1)
 * - limit (default: 5, max: 100)
 */
export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Parse and normalize pagination parameters
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;

        // Validate pagination values
        if (page < 1 || !Number.isInteger(page)) {
            throw new BadRequestError("Page must be a positive integer");
        }
        if (limit < 1 || !Number.isInteger(limit)) {
            throw new BadRequestError("Limit must be a positive integer");
        }
        if (limit > 100) {
            throw new BadRequestError("Limit cannot exceed 100 posts per page");
        }

        // Fetch paginated posts from service
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

/**
 * Retrieve a single post by ID.
 *
 * Route: GET /api/posts/:id
 * Authentication: Not required (public posts are visible)
 */
export const getPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        
        // Validate postId format
        if (!postId || typeof postId !== "string" || postId.trim() === "") {
            throw new BadRequestError("Invalid or missing post ID");
        }

        postId = postId.trim();
        const post = await postService.getPost(postId);

        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Update an existing post.
 *
 * Rules:
 * - Only post owner can update
 *
 * Route: PUT /api/posts/:id
 * Authentication: Required
 */
export const updatePost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        // Normalize and validate route param
        let postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId || typeof postId !== "string" || postId.trim() === "") {
            throw new BadRequestError("Invalid or missing post ID");
        }

        postId = postId.trim();

        // Validate request body exists
        if (!req.body || typeof req.body !== "object") {
            throw new BadRequestError("Request body is required");
        }

        // Validate request body
        validateOrThrow(req.body, updatePostRules, postMessages);

        if (!req.body.content || req.body.content.trim() === '') {
            throw new BadRequestError('Post content is required and cannot be empty');
        }

        // Handle optional thumbnail: store only filename
        let thumbnailUrl = req.body.thumbnail || "";
        if (req.file) {
            // Validate file was uploaded successfully
            if (!req.file.filename) {
                throw new BadRequestError("File upload failed - no filename");
            }
            thumbnailUrl = req.file.filename;
        }

        // Delegate update logic to service layer
        const post = await postService.updatePost(postId, req.user.id, req.body.content, thumbnailUrl);

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Delete a post.
 *
 * Rules:
 * - Only post owner can delete
 *
 * Route: DELETE /api/posts/:id
 * Authentication: Required
 */
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

/**
 * Toggle like on a post.
 *
 * Behavior:
 * - If user already liked → unlike
 * - If not liked → like
 *
 * Route: PATCH /api/posts/:id/like
 * Authentication: Required
 */
export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * Add a comment to a post.
 *
 * Route: POST /api/posts/:id/comments
 * Body: { content: string }
 * Authentication: Required
 */
export const addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId) throw new BadRequestError("Post ID is required");

        // Validate comment payload
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

/**
 * Delete a comment from a post.
 *
 * Rules:
 * - Comment owner can delete their comment
 * - Post owner can delete any comment on their post
 *
 * Route: DELETE /api/posts/:id/comments/:commentId
 * Authentication: Required
 */
export const deleteComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const commentId = Array.isArray(req.params.commentId)
            ? req.params.commentId[0]
            : req.params.commentId;

        if (!postId || !commentId) {
            throw new BadRequestError("Post ID and Comment ID are required");
        }

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
