import multer from "multer";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import { uploadToS3 } from "../utils/s3";

// Use memory storage to hold file in buffer before uploading to S3
const storage = multer.memoryStorage();

/* Configuration */
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB per file 
const MAX_TOTAL_FILES = 5;
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

// File filter for images only
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    try {
        // Validate MIME type
        if (!file.mimetype || !file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed (JPEG, PNG, GIF, WebP, etc.)"));
        }

        // Additional check: validate file extension
        const ext = path.extname(file.originalname).toLowerCase();

        if (!ALLOWED_EXTS.includes(ext) || !ALLOWED_MIMES.includes(file.mimetype)) {
            return cb(new Error(`Invalid image format. Allowed: ${ALLOWED_EXTS.join(", ")}`));
        }

        cb(null, true);
    } catch (err) {
        cb(err as Error);
    }
};

/* Use any() so dynamic field names like replaceMap[0] are accepted */
const baseUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_TOTAL_FILES, },
}).any();

/** * uploadImages middleware 
 * - Runs multer.any() 
 * - Validates fieldnames and total count 
 * - Uploads each file to S3 and attaches s3Url to file object 
 * - Attaches uploadedFiles and uploadedUrls to req 
*/
export const uploadImages = (req: Request, res: Response, next: NextFunction) => {
    baseUpload(req, res, async (err: any) => {
        if (err) { return next(err); } try {
            const files = (req.files as Express.Multer.File[]) || [];

            // Defensive total-file check 
            if (files.length > MAX_TOTAL_FILES) {
                return res.status(400).json({ success: false, message: `Too many files uploaded (max ${MAX_TOTAL_FILES})`, });
            }

            // Validate fieldnames: allowed "images" and "replaceMap[<index>]" 
            const replaceFieldRegex = /^replaceMap \[(\d+)\] $/;

            for (const f of files) {
                if (f.fieldname === "images") continue;

                const m = String(f.fieldname).match(replaceFieldRegex);
                if (!m) {
                    return res.status(400).json({ success: false, message: `Invalid file field name: ${f.fieldname}`, });
                }

                // index parsed but range validation happens in service/controller 
            }

            // Upload files to S3 in parallel 
            const uploadedFiles: (Express.Multer.File & { s3Url?: string })[] = [];
            const uploadedUrls: string[] = [];

            await Promise.all(files.map(async (file) => {
                const s3Url = await uploadToS3(file.buffer, file.originalname, file.mimetype);
                (file as any).s3Url = s3Url;
                uploadedFiles.push(file as Express.Multer.File & { s3Url?: string });
                uploadedUrls.push(s3Url);
            })
            );

            // Attach to request for controllers/services 
            (req as any).uploadedFiles = uploadedFiles;
            (req as any).uploadedUrls = uploadedUrls; next();
        }
        catch (uploadErr) {
            next(uploadErr);
        }
    });
};

// Export error handler for multer errors
export const handleUploadError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File size exceeds 1MB limit"
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files uploaded (max 5)"
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
