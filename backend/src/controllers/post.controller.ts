import { Request, Response, NextFunction } from "express";
import { createPostRules, updatePostRules, postMessages, commentRules, commentMessages } from "../validations/post.schema";
import * as postService from "../services/post.service";
import { validateOrThrow } from "../utils/validator";
import { ApiError } from "../utils/apiError";
import { BadRequestError } from "../utils/errors";

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        validateOrThrow(req.body, createPostRules, postMessages);

        const files = req.files as Express.Multer.File[] | undefined;
        const images = files && files.length ? files.map(f => `/uploads/${f.filename}`) : undefined;

        if (!req.body.content && (!images || images.length === 0)) {
            throw new BadRequestError('Either content or at least one image is required');
        }

        const post = await postService.createPost(req.user.id, req.body.content, images);

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });
    } catch (err) {
        next(err);
    }
};

export const getAllPosts = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await postService.getAllPosts();

        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: posts,
            count: posts.length
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

        const files = req.files as Express.Multer.File[] | undefined;
        const images = files && files.length ? files.map(f => `/uploads/${f.filename}`) : undefined;

        if (!req.body.content && (!images || images.length === 0)) {
            throw new BadRequestError('Either content or at least one image is required');
        }

        const post = await postService.updatePost(postId, req.user.id, req.body.content, images);

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