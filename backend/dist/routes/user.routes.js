"use strict";
/**
 * User Routes
 *
 * Handles user account management endpoints:
 * - Soft-delete current user account
 *
 * Authentication is required.
 * Base path: /api/users
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
// DELETE /api/users/me - soft delete logged-in user's account
router.delete("/me", auth_middleware_1.authMiddleware, user_controller_1.deleteAccount);
exports.default = router;
