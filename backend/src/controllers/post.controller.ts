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
import { ApiError, BadRequestError, NotFoundError } from "../utils/errors";

/**
 * Create a new post for the authenticated user.
 *
 * Route: POST /api/posts
 * Body: { content: string }
 * Files: up to 5 images (≤1MB each) under field "images"
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

        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";

        if (!content) { 
            throw new BadRequestError("Post content is required"); 
        } 
        
        // Prefer uploadedFiles (middleware attaches s3Url), fallback to multer req.files 
        const uploadedFiles = (req as any).uploadedFiles as Express.Multer.File[] | undefined; 
        const files = Array.isArray(uploadedFiles) ? uploadedFiles : Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [];

        // Delegate post creation to service layer
        const post = await postService.createPost(req.user.id, content, files);

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
        const page = parseInt(String(req.query.page || "1"), 10) || 1;
        const limit = parseInt(String(req.query.limit || "10"), 10) || 10;
        const search = typeof req.query.search === "string" ? req.query.search : undefined;

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
        const result = await postService.getAllPosts(page, limit, search);

        // Enrich each post with likes state 
        const enrichedPosts = await Promise.all( 
            result.data.map(async (postDoc: any) => { 
                const post = postDoc.toObject ? postDoc.toObject() : postDoc;

                const likesState = await postService.getLikesState(post._id.toString(), req.user?.id); 
                const commentsState = await postService.getCommentsState(post._id.toString());

                return { ...post, likesCount: likesState.likesCount, likedByCurrentUser: likesState.likedByCurrentUser, commentsCount: commentsState.commentsCount }; 
            }) 
        );

        console.log("Posts fetched:", result.data.map(p => p._id));

        return res.status(200).json({ success: true, data: enrichedPosts, pagination: result.pagination });
    } catch (error: any) {
        // Preserve known ApiError types 
        if (error instanceof BadRequestError) { return next(error); }
        return next(error);
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
        const postDoc = await postService.getPost(postId); 
        
        if (!postDoc || postDoc.isDeleted) { 
            throw new NotFoundError("Post not found"); 
        } 
        
        const post = postDoc.toObject ? postDoc.toObject() : postDoc;

        const likesState = await postService.getLikesState(postId, req.user?.id);
        const commentsState = await postService.getCommentsState(postId);

        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: { 
                ...post, 
                likesCount: likesState.likesCount, 
                likedByCurrentUser: likesState.likedByCurrentUser, 
                commentsCount: commentsState.commentsCount, 
                comments: commentsState.comments 
            }
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
 * Body: { content: string }
 * Files: optional new images (≤5, ≤1MB each) under field "images"
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

        // Prefer uploadedFiles (middleware attaches s3Url), fallback to multer req.files 
        const uploadedFiles = (req as any).uploadedFiles as (Express.Multer.File & { s3Url?: string })[] | undefined; 
        const rawFiles = Array.isArray(uploadedFiles) ? uploadedFiles : Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : []; 
        
        // Separate new images and replacements by fieldname 
        const newFiles: Express.Multer.File[] = []; 
        const replaceMap: { [index: number]: Express.Multer.File } = {}; 
        const replaceFieldRegex = /^replaceMap \[(\d+)\] $/; 
        
        for (const f of rawFiles) { 
            if (f.fieldname === "images") { 
                newFiles.push(f); continue; 
            } 
            
            const m = String(f.fieldname).match(replaceFieldRegex); 
            
            if (m) { 
                const idx = parseInt(m[1], 10); 
                if (!Number.isNaN(idx)) { 
                    replaceMap[idx] = f; 
                    continue; 
                } 
            } 
            
            // Unknown fieldname — reject request 
            throw new BadRequestError(`Invalid file field name: ${f.fieldname}`); }

        // Delegate update logic to service layer
        const post = await postService.updatePost(postId, req.user.id, req.body.content, newFiles.length > 0 ? newFiles : undefined, Object.keys(replaceMap).length > 0 ? replaceMap : undefined);

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
        if (!req.user || !req.user.id) throw new ApiError(401, "User not authenticated");

        const postId = String(req.params.id);
        const result = await postService.toggleLike(postId, req.user.id);

        res.status(200).json({
            success: true,
            message: "Toggled like",
            data: result
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

        const postId = String(req.params.id);
        if (!postId) throw new BadRequestError("Post ID is required");

        // Validate comment payload
        validateOrThrow(req.body, commentRules, commentMessages);

        const result = await postService.addComment(postId, req.user.id, req.body.content);

        res.status(201).json({
            success: true,
            message: "Comment added",
            data: { comments: result.comments, commentsCount: result.commentsCount }
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

        const postId = String(req.params.id); 
        const commentId = String(req.params.commentId);

        if (!postId || !commentId) {
            throw new BadRequestError("Post ID and Comment ID are required");
        }

        const result = await postService.deleteComment(postId, commentId, req.user.id);

        // Return updated comments state so frontend can refresh UI
        res.status(200).json({
            success: true,
            message: "Comment deleted",
            data: { comments: result.comments, commentsCount: result.commentsCount }
        });
    } catch (err) {
        next(err);
    }
};
