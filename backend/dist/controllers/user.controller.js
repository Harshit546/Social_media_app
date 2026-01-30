"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = void 0;
const user_service_1 = require("../services/user.service");
const apiError_1 = require("../utils/apiError");
const deleteAccount = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            throw new apiError_1.ApiError(401, "User not authenticated");
        }
        await (0, user_service_1.softDeleteUser)(req.user.id);
        res.status(200).json({
            success: true,
            message: "Account deleted successfully"
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAccount = deleteAccount;
