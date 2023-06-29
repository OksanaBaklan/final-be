/** @format */

import express from "express";

import {
  singleUserDetails,
  createUser,
  loginHandler,
  avatarHandler,
} from "../controllers/UserControllers.js";
import globalTryCatchHandler from "../controllers/errorControllers.js";
import { upload } from "../upload/uploadFile.js";
import { authorizationHandler } from "../middleware/authorization.js";

const router = express.Router();

// http://localhost:5656/api/users/signup
// signup user
router.post("/signup", globalTryCatchHandler(createUser));

// localhost:5656/api/users/current
router.get(
  "/current",
  authorizationHandler,
  globalTryCatchHandler(singleUserDetails)
);

// http://localhost:5656/api/users/login
router.post("/login", globalTryCatchHandler(loginHandler));

// http://localhost:5656/api/users/avatars
router.patch(
  "/avatars",
  [authorizationHandler, upload.single("avatar")],
  globalTryCatchHandler(avatarHandler)
);

export default router;
