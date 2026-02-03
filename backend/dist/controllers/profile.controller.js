"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfile = exports.getMyProfile = void 0;
const mongoose_1 = require("mongoose");
const profile_service_1 = require("../services/profile.service");
const errors_1 = require("../utils/errors");
const getMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError("User not authenticated");
        }
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const profile = await (0, profile_service_1.getProfileByUserId)(userId);
        res.status(200).json({
            success: true,
            data: profile
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errors_1.UnauthorizedError("User not authenticated");
        }
        const userId = new mongoose_1.Types.ObjectId(req.user.id);
        const avatarUrl = req.file?.filename;
        const profile = await (0, profile_service_1.updateProfile)(userId, {
            name: req.body.name,
            bio: req.body.bio,
            avatar: avatarUrl,
        });
        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: profile
        });
    }
    catch (err) {
        next(err);
    }
};
exports.updateMyProfile = updateMyProfile;
