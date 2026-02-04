import { Router } from "express";
import { logFrontendError } from "../controllers/log.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Optional: auth protects userId attribution; if not authenticated, userId will be null
router.post("/error", authMiddleware, logFrontendError);

export default router;

