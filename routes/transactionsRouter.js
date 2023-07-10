/** @format */

import express from "express";
import globalTryCatchHandler from "../controllers/errorControllers.js";
import {
  createTransactions,
  deleteTransactionById,
  editTransactionById,
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
// http://localhost:5656/api/transactions/:transactionId

router.delete(
  "/:transactionId",
  authorizationHandler,
  globalTryCatchHandler(deleteTransactionById)
);

router.patch(
  "/:transactionId",
  authorizationHandler,
  globalTryCatchHandler(editTransactionById)
);
export default router;
