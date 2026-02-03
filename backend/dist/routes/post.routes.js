"use strict";
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
const express_1 = require("express");
const postController = __importStar(require("../controllers/post.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_middleware_1 = require("../middlewares/multer.middleware");
const router = (0, express_1.Router)();
// Public route: get all posts
router.get("/", postController.getAllPosts);
// Post CRUD (requires authentication)
// Use multer to handle optional `thumbnail` file upload on create and update
// handleS3Upload middleware uploads file to S3 and stores URL in req.file.filename
router.post("/", auth_middleware_1.authMiddleware, multer_middleware_1.upload.single("thumbnail"), multer_middleware_1.handleS3Upload, multer_middleware_1.handleUploadError, postController.createPost);
router.get("/:id", postController.getPost);
router.put("/:id", auth_middleware_1.authMiddleware, multer_middleware_1.upload.single("thumbnail"), multer_middleware_1.handleS3Upload, multer_middleware_1.handleUploadError, postController.updatePost);
router.delete("/:id", auth_middleware_1.authMiddleware, postController.deletePost);
// Likes
router.patch("/:id/like", auth_middleware_1.authMiddleware, postController.toggleLike);
// Comments
router.post("/:id/comments", auth_middleware_1.authMiddleware, postController.addComment);
router.delete("/:id/comments/:commentId", auth_middleware_1.authMiddleware, postController.deleteComment);
exports.default = router;
