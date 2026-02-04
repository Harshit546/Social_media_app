/**
 * Post Routes
 * 
 * Handles all post-related endpoints including:
 * - CRUD for posts
 * - Likes toggling
 * - Adding/deleting comments
 * 
 * Authentication is required for all modifying operations.
 * Base path: /api/posts
 */

import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { uploadImages, handleUploadError } from "../middlewares/multer.middleware";

const router = Router();

// Public route: get all posts
router.get("/", postController.getAllPosts);

// Post CRUD (requires authentication)
// Use multer to handle up to 5 image files on create and update
// handleS3Upload middleware uploads file to S3 and stores URL in req.file.filename
router.post("/", authMiddleware, uploadImages, handleUploadError, postController.createPost);
router.get("/:id", postController.getPost);
router.put("/:id", authMiddleware, uploadImages, handleUploadError, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

// Likes
router.patch("/:id/like", authMiddleware, postController.toggleLike);

// Comments
router.post("/:id/comments", authMiddleware, postController.addComment);
router.delete("/:id/comments/:commentId", authMiddleware, postController.deleteComment);

export default router;
