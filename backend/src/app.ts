import express from "express"
import cors from "cors"
import path from "path"
import routes from "./routes"
import { errorHandler } from "./middlewares/error.middleware";
import { validateRequestBody } from "./middlewares/validation.middleware";
import postRoutes from "./routes/post.routes";

const app = express();

app.use(express.json());
app.use(cors());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request body validation middleware (skip for GET, DELETE)
app.use(validateRequestBody);

app.use("/api", routes);
app.use("/api/posts", postRoutes)

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;