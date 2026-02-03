"use strict";
/**
 * Post Validation Schemas
 *
 * Purpose:
 * - Define validation rules for posts and comments
 * - Provide clear and user-friendly error messages
 * - Enforce content length limits to maintain data integrity
 *
 * Endpoints Covered:
 * 1. Create Post (/api/posts)
 * 2. Update Post (/api/posts/:id)
 * 3. Add Comment (/api/posts/:id/comments)
 *
 * Notes:
 * - All content fields are required
 * - Maximum 500 characters for posts and comments
 * - Minimum 1 character to avoid empty submissions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentMessages = exports.commentRules = exports.postMessages = exports.updatePostRules = exports.createPostRules = void 0;
// POST CREATION & UPDATE VALIDATION
exports.createPostRules = {
    content: 'required|min:1|max:500' // Post content must exist and be 1-500 characters
};
exports.updatePostRules = {
    content: 'required|min:1|max:500' // Same validation as create
};
// Custom error messages for posts
exports.postMessages = {
    'content.required': 'Post content is required',
    'content.min': 'Post must be at least 1 character',
    'content.max': 'Post must be at most 500 characters'
};
// COMMENT VALIDATION
exports.commentRules = {
    content: 'required|min:1|max:500' // Comment content must exist and be 1-500 characters
};
// Custom error messages for comments
exports.commentMessages = {
    'content.required': 'Comment content is required',
    'content.min': 'Comment must be at least 1 character',
    'content.max': 'Comment must be at most 500 characters'
};
