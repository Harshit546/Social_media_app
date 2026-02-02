/**
 * Server Initialization
 * 
 * Entry point for the application:
 * - Loads environment variables from .env file
 * - Establishes database connection (via db.ts)
 * - Starts Express server on configured port
 */

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

import app from "./app"; // Import Express app
import "./config/db";     // Initialize database connection

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
});
