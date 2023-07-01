/** @format */

import express from "express";
import globalTryCatchHandler from "../controllers/errorControllers.js";
import {
  createTransactions,
  getAllTransactions,
} from "../controllers/TransactionsControllers.js";
import { authorizationHandler } from "../middleware/authorization.js";

const router = express.Router();

// http://localhost:5656/api/transactions/
router.get(
  "/",
  authorizationHandler,
  globalTryCatchHandler(getAllTransactions)
);

router.post(
  "/",
  authorizationHandler,
  globalTryCatchHandler(createTransactions)
);

export default router;
