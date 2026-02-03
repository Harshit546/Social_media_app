"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Main API Router
 *
 * Aggregates all module routes under `/api`.
 * Keeps route mounting centralized.
 */
console.log("✅ main routes index loaded");
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const post_routes_1 = __importDefault(require("./post.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const profile_routes_1 = __importDefault(require("./profile.routes"));
const router = (0, express_1.Router)();
// Mount auth module routes under /auth
router.use("/auth", auth_routes_1.default);
// Mount post module routes under /posts
router.use("/posts", post_routes_1.default);
// Mount user module routes under /users
router.use("/users", user_routes_1.default);
// Mount profile module routes under /profile
router.use("/profile", profile_routes_1.default);
exports.default = router;
