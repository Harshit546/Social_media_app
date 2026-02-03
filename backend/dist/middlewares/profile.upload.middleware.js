"use strict";
/**
 * Profile Avatar Upload Middleware
 *
 * Handles avatar uploads using multer + S3.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAvatarUpload = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const s3_1 = require("../utils/s3");
const storage = multer_1.default.memoryStorage();
const fileFilter = (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (!file.mimetype.startsWith("image/") || !allowed.includes(ext)) {
        return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
};
exports.uploadAvatar = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});
/**
 * Upload avatar to S3 and attach URL to req.file.filename
 */
const handleAvatarUpload = async (req, _res, next) => {
    if (!req.file)
        return next();
    try {
        const url = await (0, s3_1.uploadToS3)(req.file.buffer, req.file.originalname, req.file.mimetype);
        req.file.filename = url;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.handleAvatarUpload = handleAvatarUpload;
