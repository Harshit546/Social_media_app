import { Request, Response, NextFunction } from "express";
import { softDeleteUser } from "../services/user.service";

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await softDeleteUser(req.user.id);
        res.status(200).json({message: "Account deleted successfully"});
    }
    catch (err) {
        next(err);
    }
}