"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true, trim: true, maxLength: 500 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Post", postSchema);
