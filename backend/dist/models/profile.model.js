"use strict";
/**
 * Profile Model
 *
 * Stores user profile-related data.
 * Separated from User model to keep auth concerns isolated.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const profileSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    name: {
        type: String,
        trim: true,
        maxlength: 100
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 300
    },
    avatar: {
        type: String // S3 public URL
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Profile", profileSchema);
