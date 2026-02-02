import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";

// Ensure uploads directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage config for local storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Verify directory exists before writing
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        try {
            // Example: post-12345-1678912345.jpg
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const ext = path.extname(file.originalname);
            const filename = `post-${uniqueSuffix}${ext}`;
            cb(null, filename);
        } catch (err: any) {
            cb(err);
        }
    }
});

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
