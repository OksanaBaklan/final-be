/** @format */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import logger from "morgan";

import usersRouter from "./routes/usersRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const formatsLogger = app.get("env") === "development" ? "dev" : "short";
app.use(logger(formatsLogger));

app.use("/api/users", usersRouter);
// app.use("/api/transactions", transactionsRouter);

app.use((error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.message = error.message || "Something went wrong";

  res.status(error.statusCode).send(error.message);
});

connectDB();
app.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});
