"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.softDeleteUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
const softDeleteUser = async (userId) => {
    try {
        if (!userId) {
            throw new errors_1.BadRequestError("User ID is required");
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError("User");
        }
        user.isDeleted = true;
        await user.save();
    }
    catch (error) {
        if (error instanceof errors_1.NotFoundError || error instanceof errors_1.BadRequestError) {
            throw error;
        }
        if (error.name === "ValidationError") {
            throw new errors_1.BadRequestError(error.message);
        }
        throw new errors_1.DatabaseError("Failed to delete user account");
    }
};
exports.softDeleteUser = softDeleteUser;
