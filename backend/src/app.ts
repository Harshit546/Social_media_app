/**
 * Express App Configuration
 * Main application setup that configures middleware, routes, and error handling
 */

import 'express-async-errors'
import express from "express"
import cors from "cors"
import routes from "./routes"
import { errorHandler } from "./middlewares/error.middleware";
import { validateRequestBody } from "./middlewares/validation.middleware";
import path from "path";

const app = express();

// Body parser with size limits to prevent memory issues
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration - allow requests from frontend
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request body validation middleware
app.use(validateRequestBody);

app.use("/api", routes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Global error handler - must be last
app.use(errorHandler);

export default app;