"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const validation_middleware_1 = require("./middlewares/validation.middleware");
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Serve uploaded images
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads')));
// Request body validation middleware (skip for GET, DELETE)
app.use(validation_middleware_1.validateRequestBody);
app.use("/api", routes_1.default);
app.use("/api/posts", post_routes_1.default);
// Error handling middleware (must be last)
app.use(error_middleware_1.errorHandler);
exports.default = app;
