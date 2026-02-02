import { Request, Response, NextFunction } from "express";
import { softDeleteUser } from "../services/user.service";
import { ApiError, BadRequestError } from "../utils/errors";

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            throw new ApiError(401, "User not authenticated");
        }

        await softDeleteUser(req.user.id);

        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};