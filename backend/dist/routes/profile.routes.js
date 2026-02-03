"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Profile Routes
 *
 * Handles:
 * - Get current user's profile
 * - Update profile info + avatar
 *
 * Base path: /api/profile
 */
console.log("✅ profile.routes.ts loaded");
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const profile_controller_1 = require("../controllers/profile.controller");
const profile_upload_middleware_1 = require("../middlewares/profile.upload.middleware");
const router = (0, express_1.Router)();
// GET /api/profile/me
router.get("/me", auth_middleware_1.authMiddleware, profile_controller_1.getMyProfile);
// PUT /api/profile/me
router.put("/me", auth_middleware_1.authMiddleware, profile_upload_middleware_1.uploadAvatar.single("avatar"), profile_upload_middleware_1.handleAvatarUpload, profile_controller_1.updateMyProfile);
exports.default = router;
