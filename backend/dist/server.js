"use strict";
/**
 * Server Initialization
 *
 * Entry point for the application:
 * - Loads environment variables from .env file
 * - Establishes database connection (via db.ts)
 * - Starts Express server on configured port
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env
const app_1 = __importDefault(require("./app")); // Import Express app
require("./config/db"); // Initialize database connection
const PORT = process.env.PORT || 5000;
// Start server
app_1.default.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
});
