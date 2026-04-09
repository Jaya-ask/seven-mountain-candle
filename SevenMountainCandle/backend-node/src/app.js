import cors from "cors";
import express from "express";

import {
	globalErrorHandler,
	notFoundHandler
} from "./middlewares/errorMiddleware.js";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiRoutes);
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
