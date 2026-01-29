import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { deleteAccount } from "../controllers/user.controller";

const router = Router();

router.delete("/me", authMiddleware, deleteAccount);

export default router;