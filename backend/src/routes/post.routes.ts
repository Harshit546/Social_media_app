import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", postController.getAllPosts);
router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

// likes
router.patch("/:id/like", authMiddleware, postController.toggleLike);

// comments
router.post("/:id/comments", authMiddleware, postController.addComment);
router.delete("/:id/comments/:commentId", authMiddleware, postController.deleteComment);

export default router;