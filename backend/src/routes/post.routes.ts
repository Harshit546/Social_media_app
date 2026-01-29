import { Router } from "express";
import * as postController from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", postController.getAllPosts);
router.post("/", authMiddleware, postController.createPost);
router.put("/:id", authMiddleware, postController.updatePost);
router.delete("/:id", authMiddleware, postController.deletePost);

export default router;