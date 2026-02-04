import { Request, Response, NextFunction } from "express";
import ErrorLog from "../models/errorLog.model";

/**
 * Log a client-side (frontend) error into the ErrorLog collection.
 *
 * Route: POST /api/logs/error
 * Body: {
 *   apiName?: string;
 *   errorDetail: any;
 * }
 *
 * userId will be inferred from req.user if present.
 */
export const logFrontendError = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { apiName, errorDetail } = req.body || {};

        if (!errorDetail) {
            return res.status(400).json({
                success: false,
                message: "errorDetail is required",
            });
        }

        const timestamp = new Date();

        await ErrorLog.create({
            apiName: typeof apiName === "string" ? apiName : req.originalUrl,
            service: "frontend",
            errorDetail,
            userId: (req as any).user?.id ?? null,
            errorOccurredTime: timestamp,
        });

        res.status(201).json({
            success: true,
            message: "Frontend error logged",
        });
    } catch (err) {
        next(err);
    }
};

