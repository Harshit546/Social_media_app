/**
 * User Routes
 * 
 * Handles user account management endpoints:
 * - Soft-delete current user account
 * 
 * Authentication is required.
 * Base path: /api/users
 */

import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { deleteAccount } from "../controllers/user.controller";

const router = Router();

// DELETE /api/users/me - soft delete logged-in user's account
router.delete("/me", authMiddleware, deleteAccount);

export default router;
