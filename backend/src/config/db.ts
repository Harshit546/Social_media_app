/**
 * Database Configuration Module
 *
 * Purpose:
 * - Initialize MongoDB connection using Mongoose
 * - Ensure environment configuration is valid
 * - Provide early failure for missing or invalid URI
 *
 * Notes:
 * - This module should be imported once in the app entry point (e.g., server.ts/app.ts)
 * - Mongoose connection is global; no need to reconnect multiple times
 */

import mongoose from "mongoose";

/**
 * Ensure MONGO_URI environment variable is defined.
 * Fails fast if missing to prevent silent errors.
 */
if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI environment variable is not set");
    console.error("Please create a .env file with MONGO_URI=your_mongodb_connection_string");
    process.exit(1);
}

/**
 * Connect to MongoDB using Mongoose.
 *
 * Promises are used for async connection handling.
 * Logs success or exits process on failure.
 */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1); // Exit to avoid running app without database
    });
    