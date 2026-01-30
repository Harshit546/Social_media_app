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
exports.deletePost = exports.updatePost = exports.getAllPosts = exports.createPost = void 0;
const post_schema_1 = require("../validations/post.schema");
const postService = __importStar(require("../services/post.service"));
const validator_1 = require("../utils/validator");
const apiError_1 = require("../utils/apiError");
const errors_1 = require("../utils/errors");
const createPost = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new apiError_1.ApiError(401, "User not authenticated");
        }
        (0, validator_1.validateOrThrow)(req.body, post_schema_1.createPostRules, post_schema_1.postMessages);
        const files = req.files;
        const images = files && files.length ? files.map(f => `/uploads/${f.filename}`) : undefined;
        if (!req.body.content && (!images || images.length === 0)) {
            throw new errors_1.BadRequestError('Either content or at least one image is required');
        }
        const post = await postService.createPost(req.user.id, req.body.content, images);
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
const getAllPosts = async (_req, res, next) => {
    try {
        const posts = await postService.getAllPosts();
        res.status(200).json({
            success: true,
            message: "Posts retrieved successfully",
            data: posts,
            count: posts.length
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllPosts = getAllPosts;
const updatePost = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new apiError_1.ApiError(401, "User not authenticated");
        }
        const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!postId) {
            throw new errors_1.BadRequestError("Post ID is required");
        }
        (0, validator_1.validateOrThrow)(req.body, post_schema_1.updatePostRules, post_schema_1.postMessages);
        const files = req.files;
        const images = files && files.length ? files.map(f => `/uploads/${f.filename}`) : undefined;
        if (!req.body.content && (!images || images.length === 0)) {
            throw new errors_1.BadRequestError('Either content or at least one image is required');
        }
        const post = await postService.updatePost(postId, req.user.id, req.body.content, images);
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
const deletePost = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new apiError_1.ApiError(401, "User not authenticated");
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
