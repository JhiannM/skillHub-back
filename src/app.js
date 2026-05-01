import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import dotnev from "dotenv";
import { swaggerDocs } from "./config/swagger.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/auth.routes.js";
import providersRoutes from "./modules/providers/providers.routes.js";

const app = express();



dotnev.config();


app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

// Body parser middleware
app.use(express.json());

// Swagger docs
app.use("/api/docs", ...swaggerDocs);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/providers", providersRoutes);

// Error middleware (SIEMPRE al final)
app.use(errorMiddleware);

export default app;