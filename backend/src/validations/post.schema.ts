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

// POST CREATION & UPDATE VALIDATION

export const createPostRules = {
    content: 'required|min:1|max:500'  // Post content must exist and be 1-500 characters
};

export const updatePostRules = {
    content: 'required|min:1|max:500'  // Same validation as create
};

// Custom error messages for posts
export const postMessages = {
    'content.required': 'Post content is required',
    'content.min': 'Post must be at least 1 character',
    'content.max': 'Post must be at most 500 characters'
};

// COMMENT VALIDATION

export const commentRules = {
    content: 'required|min:1|max:500'  // Comment content must exist and be 1-500 characters
};

// Custom error messages for comments
export const commentMessages = {
    'content.required': 'Comment content is required',
    'content.min': 'Comment must be at least 1 character',
    'content.max': 'Comment must be at most 500 characters'
};
