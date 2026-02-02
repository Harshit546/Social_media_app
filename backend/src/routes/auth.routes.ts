/**
 * Authentication Routes
 * 
 * Handles authentication endpoints:
 * - User registration
 * - User login
 * 
 * Base path: /api/auth
 */

import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

// POST /api/auth/register - register a new user
router.post("/register", authController.register);

// POST /api/auth/login - login an existing user
router.post("/login", authController.login);

export default router;
