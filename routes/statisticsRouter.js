/** @format */

import express from "express";
import { authorizationHandler } from "../middleware/authorization.js";
import globalTryCatchHandler from "../controllers/errorControllers.js";
import { getStatistics } from "../controllers/StatisticsController.js";

const router = express.Router();

// http://localhost:5656/api/statistics/

router.get("/", authorizationHandler, globalTryCatchHandler(getStatistics));

export default router;
