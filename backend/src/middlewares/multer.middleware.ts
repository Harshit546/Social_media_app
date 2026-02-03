import multer from "multer";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import { uploadToS3 } from "../utils/s3";

// Use memory storage to hold file in buffer before uploading to S3
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: any) => {
    try {
        // Validate MIME type
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, etc.)"));
        }

        // Additional check: validate file extension
        const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (!allowedExts.includes(ext)) {
            return cb(new Error(`Invalid file extension. Allowed: ${allowedExts.join(", ")}`));
        }

        cb(null, true);
    } catch (err) {
        cb(err);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

/**
 * Middleware to handle S3 upload after multer processes the file
 * Attaches S3 URL to req.file.filename for compatibility
 */
export const handleS3Upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.file) {
            // Upload file buffer to S3
            const s3Url = await uploadToS3(
                req.file.buffer,
                req.file.originalname,
                req.file.mimetype
            );
            
            // Store S3 URL as filename for compatibility with existing code
            req.file.filename = s3Url;
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

// Export error handler for multer errors
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 5MB limit"
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded"
            });
        }
        return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`
        });
    }

    if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "File upload failed"
        });
    }

    next();
};
