import 'express-async-errors'
import express from "express"
import cors from "cors"
import routes from "./routes"
import { errorHandler } from "./middlewares/error.middleware";
import { validateRequestBody } from "./middlewares/validation.middleware";
import postRoutes from "./routes/post.routes";

const app = express();

// Body parser with size limits to prevent memory issues
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Request body validation middleware (skip for GET, DELETE)
app.use(validateRequestBody);

app.use("/api", routes);
app.use("/api/posts", postRoutes)

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;