/** @format */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import logger from "morgan";
import swaggerUi from "swagger-ui-express";
// import swaggerDocument from "./swagger.json" assert { type: "json" };
import path, { dirname } from "path";
import { fileURLToPath } from "url";

import usersRouter from "./routes/usersRouter.js";
import transactionRouter from "./routes/transactionsRouter.js";
import statisticsRouter from "./routes/statisticsRouter.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "/images")));

const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionRouter);
app.use("/api/statistics", statisticsRouter);

// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// http://localhost:5656/api-docs/

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Something went wrong";

  res.status(error.statusCode).send(error.message);
});

connectDB();
app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
