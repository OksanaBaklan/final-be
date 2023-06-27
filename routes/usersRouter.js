/** @format */

import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import { singleUserDetails,createUser } from "../controllers/UserControllers.js";
const router = express.Router();

//current user,
router.get("/current", singleUserDetails);
router.post("/login",createUser)

export default router;
