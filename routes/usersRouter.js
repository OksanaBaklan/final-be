/** @format */

import express from "express";

import {
  singleUserDetails,
  createUser,
  loginHandler,
  logoutHandler,
  avatarHandler,
  avatarUploader,
  emailConfirmationHandler,
  verificationTokenHandler,
  authorizeUser,
  passwordReset,
  passwordRecovery,
} from "../controllers/UserControllers.js";
import globalTryCatchHandler from "../controllers/errorControllers.js";
// import { upload } from "../upload/uploadFile.js";
import { authorizationHandler } from "../middleware/authorization.js";
import multer from "multer";

const router = express.Router();

// http://localhost:5656/api/users/signup
router.post("/signup", globalTryCatchHandler(createUser));

// http://localhost:5656/api/users/login
router.post("/login", globalTryCatchHandler(loginHandler));

// http://localhost:5656/api/users/verify
router.post("/verify", globalTryCatchHandler(emailConfirmationHandler));

//`http://localhost:5555/api/users/authorize-user
router.get(
  "/authorize-user",
  authorizationHandler,
  globalTryCatchHandler(authorizeUser)
);

// http://localhost:5656/api/users/verify/:verificationToken
router.get(
  "/verify/:verificationToken",
  globalTryCatchHandler(verificationTokenHandler)
);

// localhost:5656/api/users/current
router.get(
  "/current",
  authorizationHandler,
  globalTryCatchHandler(singleUserDetails)
);

// http://localhost:5656/api/users/logout
router.get(
  "/logout",
  authorizationHandler,
  globalTryCatchHandler(logoutHandler)
);

// http://localhost:5656/api/users/avatars
// router.patch(
//   "/avatars",
//   [authorizationHandler, upload.single("avatar")],
//   globalTryCatchHandler(avatarHandler)
// );
const upload = multer({ dest: "images/" });

// http://localhost:5656/api/users/avatars

router.patch(
  "/avatars",
  upload.single("image"),
  authorizationHandler,
  globalTryCatchHandler(avatarUploader)
);
// http://localhost:5555/api/users/password-reset

router.post("/password-reset", globalTryCatchHandler(passwordReset));
router.put("/password-reset", globalTryCatchHandler(passwordRecovery));


export default router;
