"use strict";
/**
 * AWS S3 Upload Utility
 *
 * Handles file uploads to AWS S3 for thumbnail storage.
 * Uses AWS SDK v2 for simplicity.
 *
 * Environment Variables Required:
 * - AWS_ACCESS_KEY_ID: AWS access key
 * - AWS_SECRET_ACCESS_KEY: AWS secret key
 * - AWS_S3_BUCKET: S3 bucket name
 * - AWS_S3_REGION: AWS region (default: us-east-1)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromS3 = exports.uploadToS3 = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const errors_1 = require("./errors");
// Configure AWS SDK
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION || 'us-east-1'
});
/**
 * Upload file to S3
 *
 * @param fileBuffer - File buffer to upload
 * @param fileName - Name for the file in S3
 * @param mimeType - MIME type of the file
 * @returns S3 URL of the uploaded file
 */
const uploadToS3 = async (fileBuffer, fileName, mimeType) => {
    try {
        const bucketName = process.env.AWS_S3_BUCKET;
        if (!bucketName) {
            throw new errors_1.BadRequestError('S3 bucket not configured');
        }
        // Generate unique key (filename in S3)
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        const key = `thumbnails/${timestamp}-${random}-${fileName}`;
        // Upload to S3
        const params = {
            Bucket: bucketName,
            Key: key,
            Body: fileBuffer,
            ContentType: mimeType,
            // ACL: 'public-read' // Make file publicly accessible
        };
        const result = await s3.upload(params).promise();
        return result.Location; // Returns full S3 URL
    }
    catch (error) {
        console.error('S3 upload error:', error);
        throw new errors_1.BadRequestError('Failed to upload file to S3');
        // throw error;
    }
};
exports.uploadToS3 = uploadToS3;
/**
 * Delete file from S3
 *
 * @param fileUrl - Full S3 URL of the file to delete
 */
const deleteFromS3 = async (fileUrl) => {
    try {
        if (!fileUrl) {
            return;
        }
        const bucketName = process.env.AWS_S3_BUCKET;
        if (!bucketName) {
            throw new errors_1.BadRequestError('S3 bucket not configured');
        }
        // Extract key from URL
        // URL format: https://bucket-name.s3.region.amazonaws.com/key
        const urlParts = fileUrl.split('/');
        const key = urlParts.slice(3).join('/'); // Everything after domain
        const params = {
            Bucket: bucketName,
            Key: key
        };
        await s3.deleteObject(params).promise();
    }
    catch (error) {
        console.error('S3 delete error:', error);
        // Don't throw error on delete failure - file might not exist
    }
};
exports.deleteFromS3 = deleteFromS3;
