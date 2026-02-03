"use strict";
/**
 * Express App Configuration
 * Main application setup that configures middleware, routes, and error handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const validation_middleware_1 = require("./middlewares/validation.middleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Body parser with size limits to prevent memory issues
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// CORS configuration - allow requests from frontend
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
// Request body validation middleware
app.use(validation_middleware_1.validateRequestBody);
app.use("/api", routes_1.default);
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
// Global error handler - must be last
app.use(error_middleware_1.errorHandler);
exports.default = app;
