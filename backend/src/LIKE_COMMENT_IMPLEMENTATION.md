/**
 * ============================================================
 * LIKE AND COMMENT FUNCTIONALITY - IMPLEMENTATION GUIDE
 * ============================================================
 * 
 * This document explains the like and comment implementation
 * in the Social Media App backend.
 */

/**
 * LIKE FUNCTIONALITY
 * ============================================================
 * 
 * Endpoint: PATCH /api/posts/:id/like
 * Authentication: Required (Bearer token)
 * Body: Empty (no request body needed)
 * 
 * Flow:
 * 1. User sends PATCH request to toggle like
 * 2. authMiddleware validates JWT token
 * 3. toggleLike controller is called with authenticated user ID
 * 4. Service checks if post exists
 * 5. Service checks if user already liked the post
 * 6. If already liked: Remove user ID from post.likes array
 * 7. If not liked: Add user ID to post.likes array
 * 8. Save updated post to database
 * 9. Populate user data and return post with all likes
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Toggled like",
 *   "data": { post object with updated likes array }
 * }
 * 
 * Key Points:
 * - Likes are stored as an array of User IDs in the post document
 * - Each post has a virtual field 'likesCount' that returns the length of likes array
 * - Toggling is idempotent (clicking like twice removes like, 3rd time adds it back)
 * - No separate like document needed - just track in post.likes array
 */

/**
 * COMMENT FUNCTIONALITY
 * ============================================================
 * 
 * Add Comment:
 * Endpoint: POST /api/posts/:id/comments
 * Authentication: Required (Bearer token)
 * Body: { "content": "string" }
 * 
 * Flow:
 * 1. User sends POST request with comment content
 * 2. authMiddleware validates JWT token
 * 3. addComment controller validates input using ValidatorJS rules
 * 4. Service checks if post exists
 * 5. Service creates comment object: { user: userId, content: string }
 * 6. Comment is pushed to post.comments array
 * 7. Post is saved to database
 * 8. Populated post is returned with embedded comments
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Comment added",
 *   "data": { newly added comment object },
 *   "post": { updated post object with all comments }
 * }
 * 
 * Delete Comment:
 * Endpoint: DELETE /api/posts/:id/comments/:commentId
 * Authentication: Required (Bearer token)
 * Body: Empty
 * 
 * Flow:
 * 1. User sends DELETE request
 * 2. authMiddleware validates JWT token
 * 3. deleteComment controller extracts post ID and comment ID
 * 4. Service checks if post exists
 * 5. Service finds comment by ID
 * 6. Service checks authorization:
 *    - Comment owner can delete their own comment
 *    - Post owner can delete any comment on their post
 * 7. If authorized: Filter out the comment from post.comments array
 * 8. Post is saved to database
 * 9. Populated post is returned
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Comment deleted",
 *   "data": { updated post object }
 * }
 * 
 * Key Points:
 * - Comments are embedded in the post document (not separate collection)
 * - Each comment has: _id (auto-generated), user (ref to User), content, createdAt
 * - Comments are validated to have content between 1-500 characters
 * - Post owner can delete any comment, not just their own
 * - Each post has a virtual field 'commentsCount' that returns length of comments array
 */

/**
 * DATABASE SCHEMA
 * ============================================================
 * 
 * Post Document Structure:
 * {
 *   _id: ObjectId,
 *   user: ObjectId (ref to User),
 *   content: String (required, max 500),
 *   likes: [ObjectId] (array of user IDs who liked),
 *   comments: [
 *     {
 *       _id: ObjectId (auto-generated),
 *       user: ObjectId (ref to User),
 *       content: String (required, max 500),
 *       createdAt: Date
 *     }
 *   ],
 *   createdAt: Date,
 *   updatedAt: Date,
 *   likesCount: Number (virtual - length of likes array),
 *   commentsCount: Number (virtual - length of comments array)
 * }
 */

/**
 * VALIDATION RULES
 * ============================================================
 * 
 * Comment Validation (ValidatorJS):
 * - content: required|min:1|max:500
 * 
 * Error Messages:
 * - content.required: "Comment content is required"
 * - content.min: "Comment must be at least 1 character"
 * - content.max: "Comment must be at most 500 characters"
 */

/**
 * MIDDLEWARE CONFIGURATION
 * ============================================================
 * 
 * Request Body Validation Middleware:
 * - Skips validation for GET, DELETE, PATCH methods
 * - PATCH is skipped because toggle like endpoint has no body
 * - POST and PUT require non-empty body
 * 
 * Auth Middleware:
 * - Validates JWT token from Authorization header (Bearer token)
 * - Extracts user info and attaches to req.user
 * - Required for all like and comment endpoints
 */

/**
 * ERROR HANDLING
 * ============================================================
 * 
 * Possible Errors:
 * 
 * 400 Bad Request:
 * - Invalid post ID
 * - Invalid comment ID
 * - Missing required parameters
 * - Invalid comment content
 * 
 * 401 Unauthorized:
 * - User not authenticated (missing/invalid token)
 * 
 * 403 Forbidden:
 * - User trying to delete comment they don't own (and not post owner)
 * 
 * 404 Not Found:
 * - Post not found
 * - Comment not found
 * 
 * 500 Internal Server Error:
 * - Database operation failed
 * - MongoDB connection issues
 */

/**
 * FIXES APPLIED
 * ============================================================
 * 
 * Issue 1: PATCH request rejected by middleware
 * - Fix: Added PATCH to list of excluded methods in validation middleware
 * - Reason: Toggle like endpoint sends empty PATCH request
 * 
 * Issue 2: populatePost function returning promise incorrectly
 * - Fix: Replaced with direct populate() calls on updated document
 * - Reason: Original function not properly awaiting promise
 * 
 * Issue 3: Type casting with 'as any' in like toggle
 * - Fix: Removed unsafe type casting
 * - Reason: Proper typing already available from Mongoose
 */
