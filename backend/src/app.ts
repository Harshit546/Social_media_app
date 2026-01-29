import express from "express"
import cors from "cors"
import routes from "./routes"
import {errorHandler} from "./middlewares/error.middleware";
import postRoutes from "./routes/post.routes";

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", routes);
app.use("/api/posts", postRoutes)
app.use(errorHandler);

export default app;