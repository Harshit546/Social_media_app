"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.updatePost = exports.getAllPosts = exports.createPost = void 0;
const post_model_1 = __importDefault(require("../models/post.model"));
const mongoose_1 = require("mongoose");
const errors_1 = require("../utils/errors");
const createPost = async (userId, content, images) => {
    try {
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        const post = await post_model_1.default.create({
            content: content || undefined,
            // images: images || [],
            user: userId
        });
        return post;
    }
    catch (error) {
        if (error instanceof errors_1.BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        throw new errors_1.DatabaseError("Failed to create post");
    }
};
exports.createPost = createPost;
const getAllPosts = async () => {
    try {
        const posts = await post_model_1.default.find()
            .populate({ path: "user", select: "email", match: { isDeleted: false } })
            .sort({ createdAt: -1 });
        return posts;
    }
    catch (error) {
        throw new errors_1.DatabaseError("Failed to retrieve posts");
    }
};
exports.getAllPosts = getAllPosts;
const updatePost = async (postId, userId, content, images) => {
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
        if (post.user.toString() !== userId.toString()) {
            throw new errors_1.ForbiddenError("You can only edit your own posts");
        }
        post.content = content || post.content;
        // if (images) {
        //     post.images = images;
        // }
        const updatedPost = await post.save();
        return updatedPost;
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ForbiddenError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        throw new errors_1.DatabaseError("Failed to update post");
    }
};
exports.updatePost = updatePost;
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
        if (post.user.toString() !== userId.toString()) {
            throw new errors_1.ForbiddenError("You can only delete your own posts");
        }
        await post.deleteOne();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.ForbiddenError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        throw new errors_1.DatabaseError("Failed to delete post");
    }
};
exports.deletePost = deletePost;
