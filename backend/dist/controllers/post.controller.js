"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.addComment = exports.toggleLike = exports.deletePost = exports.updatePost = exports.getPost = exports.getAllPosts = exports.createPost = void 0;
const post_schema_1 = require("../validations/post.schema");
const postService = __importStar(require("../services/post.service"));
const validator_1 = require("../utils/validator");
const errors_1 = require("../utils/errors");
/**
 * Create a new post for the authenticated user.
 *
 * Route: POST /api/posts
 * Body: { content: string }
 * Authentication: Required
 */
const createPost = async (req, res, next) => {
    try {
        // Ensure request is authenticated
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        // Validate request body against schema
        (0, validator_1.validateOrThrow)(req.body, post_schema_1.createPostRules, post_schema_1.postMessages);
        const content = req.body.content;
        // Handle optional thumbnail: store only filename, frontend will build full URL
        let thumbnailUrl = "";
        if (req.file) {
            thumbnailUrl = req.file.filename;
        }
        // Extra safeguard for empty or whitespace-only content
        if (!req.body.content || req.body.content.trim() === '') {
            throw new errors_1.BadRequestError('Post content is required');
        }
        // Delegate post creation to service layer
        const post = await postService.createPost(req.user.id, content, thumbnailUrl);
        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post
        });
    }
    catch (err) {
        next(err);
    }
};
exports.createPost = createPost;
/**
 * Retrieve paginated list of posts.
 *
 * Route: GET /api/posts
 * Query params:
 * - page (default: 1)
 * - limit (default: 5, max: 100)
 */
const getAllPosts = async (req, res, next) => {
    try {
        // Parse and normalize pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        // Validate pagination values
        if (page < 1 || !Number.isInteger(page)) {
            throw new errors_1.BadRequestError("Page must be a positive integer");
        }
        if (limit < 1 || !Number.isInteger(limit)) {
            throw new errors_1.BadRequestError("Limit must be a positive integer");
        }
        if (limit > 100) {
            throw new errors_1.BadRequestError("Limit cannot exceed 100 posts per page");
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
    }
    catch (err) {
        next(err);
    }
};
exports.getAllPosts = getAllPosts;
/**
 * Retrieve a single post by ID.
 *
 * Route: GET /api/posts/:id
 * Authentication: Not required (public posts are visible)
 */
const getPost = async (req, res, next) => {
    try {
        let postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        // Validate postId format
        if (!postId || typeof postId !== "string" || postId.trim() === "") {
            throw new errors_1.BadRequestError("Invalid or missing post ID");
        }
        postId = postId.trim();
        const post = await postService.getPost(postId);
        res.status(200).json({
            success: true,
            message: "Post retrieved successfully",
            data: post
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getPost = getPost;
/**
 * Update an existing post.
 *
 * Rules:
 * - Only post owner can update
 *
 * Route: PUT /api/posts/:id
 * Authentication: Required
 */
const updatePost = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        // Normalize and validate route param
        let postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId || typeof postId !== "string" || postId.trim() === "") {
            throw new errors_1.BadRequestError("Invalid or missing post ID");
        }
        postId = postId.trim();
        // Validate request body exists
        if (!req.body || typeof req.body !== "object") {
            throw new errors_1.BadRequestError("Request body is required");
        }
        // Validate request body
        (0, validator_1.validateOrThrow)(req.body, post_schema_1.updatePostRules, post_schema_1.postMessages);
        if (!req.body.content || req.body.content.trim() === '') {
            throw new errors_1.BadRequestError('Post content is required and cannot be empty');
        }
        // Handle optional thumbnail: store only filename
        let thumbnailUrl = req.body.thumbnail || "";
        if (req.file) {
            // Validate file was uploaded successfully
            if (!req.file.filename) {
                throw new errors_1.BadRequestError("File upload failed - no filename");
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
    }
    catch (err) {
        next(err);
    }
};
exports.updatePost = updatePost;
/**
 * Delete a post.
 *
 * Rules:
 * - Only post owner can delete
 *
 * Route: DELETE /api/posts/:id
 * Authentication: Required
 */
const deletePost = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId) {
            throw new errors_1.BadRequestError("Post ID is required");
        }
        await postService.deletePost(postId, req.user.id);
        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deletePost = deletePost;
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
const toggleLike = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId)
            throw new errors_1.BadRequestError("Post ID is required");
        const post = await postService.toggleLike(postId, req.user.id);
        res.status(200).json({
            success: true,
            message: "Toggled like",
            data: post
        });
    }
    catch (err) {
        next(err);
    }
};
exports.toggleLike = toggleLike;
/**
 * Add a comment to a post.
 *
 * Route: POST /api/posts/:id/comments
 * Body: { content: string }
 * Authentication: Required
 */
const addComment = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId)
            throw new errors_1.BadRequestError("Post ID is required");
        // Validate comment payload
        (0, validator_1.validateOrThrow)(req.body, post_schema_1.commentRules, post_schema_1.commentMessages);
        const result = await postService.addComment(postId, req.user.id, req.body.content);
        res.status(201).json({
            success: true,
            message: "Comment added",
            data: result.comment,
            post: result.post
        });
    }
    catch (err) {
        next(err);
    }
};
exports.addComment = addComment;
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
const deleteComment = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new errors_1.ApiError(401, "User not authenticated");
        }
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const commentId = Array.isArray(req.params.commentId)
            ? req.params.commentId[0]
            : req.params.commentId;
        if (!postId || !commentId) {
            throw new errors_1.BadRequestError("Post ID and Comment ID are required");
        }
        const post = await postService.deleteComment(postId, commentId, req.user.id);
        res.status(204).json({
            success: true,
            message: "Comment deleted",
            data: post
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteComment = deleteComment;
