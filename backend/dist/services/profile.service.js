"use strict";
/**
 * Profile Service
 *
 * Contains business logic for profile operations.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileByUserId = void 0;
const profile_model_1 = __importDefault(require("../models/profile.model"));
const errors_1 = require("../utils/errors");
const s3_1 = require("../utils/s3");
const getProfileByUserId = async (userId) => {
    const profile = await profile_model_1.default.findOne({ user: userId }).populate("user", "email role");
    if (!profile) {
        throw new errors_1.NotFoundError("Profile");
    }
    return profile;
};
exports.getProfileByUserId = getProfileByUserId;
const updateProfile = async (userId, data) => {
    const profile = await profile_model_1.default.findOne({ user: userId });
    if (!profile) {
        throw new errors_1.NotFoundError("Profile");
    }
    if (data.name !== undefined) {
        profile.name = data.name.trim();
    }
    if (data.bio !== undefined) {
        profile.bio = data.bio.trim();
    }
    // Replace avatar if new one is uploaded
    if (data.avatar) {
        if (profile.avatar && profile.avatar !== data.avatar) {
            try {
                await (0, s3_1.deleteFromS3)(profile.avatar);
            }
            catch (err) {
                console.warn("Failed to delete old avatar:", err);
            }
        }
        profile.avatar = data.avatar;
    }
    await profile.save();
    return profile;
};
exports.updateProfile = updateProfile;
