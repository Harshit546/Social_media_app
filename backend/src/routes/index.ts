/**
 * Main API Router
 * 
 * Aggregates all module routes under `/api`.
 * Keeps route mounting centralized.
 */

import { Router } from "express";
import authRoutes from "./auth.routes";
import postRoutes from "./post.routes";
import userRoutes from "./user.routes";

const router = Router();

// Mount auth module routes under /auth
router.use("/auth", authRoutes);

// Mount post module routes under /posts
router.use("/posts", postRoutes);

// Mount user module routes under /users
router.use("/users", userRoutes);

export default router;
