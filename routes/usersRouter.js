/** @format */

import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { singleUserDetails } from "../controllers/UserControllers.js";
const router = express.Router();

//current user,
router.get("/current", singleUserDetails);

export default router;
