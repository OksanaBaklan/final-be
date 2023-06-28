/** @format */

import express from "express";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs/promises";
import {
  singleUserDetails,
  createUser,
  loginHandler,avatarHandler
} from "../controllers/UserControllers.js";
import globalTryCatchHandler from "../controllers/errorControllers.js";
import { upload } from "../upload/uploadFile.js";

const router = express.Router();

// http://localhost:5656/api/users/signup
// signup user
router.post("/signup", globalTryCatchHandler(createUser));
// localhost:5656/api/users/current/:userid
router.get("/current/:userId", globalTryCatchHandler(singleUserDetails));
// http://localhost:5656/api/users/login
router.post("/login", globalTryCatchHandler(loginHandler));
// http://localhost:5656/api/users/avatars

router.patch("/avatars", [ upload.single("avatar")], globalTryCatchHandler(avatarHandler));

export default router;
