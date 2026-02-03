"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.handleS3Upload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const s3_1 = require("../utils/s3");
// Use memory storage to hold file in buffer before uploading to S3
const storage = multer_1.default.memoryStorage();
// File filter for images only
const fileFilter = (req, file, cb) => {
    try {
        // Validate MIME type
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, etc.)"));
        }
        // Additional check: validate file extension
        const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (!allowedExts.includes(ext)) {
            return cb(new Error(`Invalid file extension. Allowed: ${allowedExts.join(", ")}`));
        }
        cb(null, true);
    }
    catch (err) {
        cb(err);
    }
};
exports.upload = (0, multer_1.default)({
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
const handleS3Upload = async (req, res, next) => {
    try {
        if (req.file) {
            // Upload file buffer to S3
            const s3Url = await (0, s3_1.uploadToS3)(req.file.buffer, req.file.originalname, req.file.mimetype);
            // Store S3 URL as filename for compatibility with existing code
            req.file.filename = s3Url;
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.handleS3Upload = handleS3Upload;
// Export error handler for multer errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer_1.default.MulterError) {
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
exports.handleUploadError = handleUploadError;
