/** @format */

import multer from "multer";
import { tempDir } from "../constants/directories.js";

const multerConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
    // cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  // filename: function (req, file, cb) {
  //   const extName = file.mimetype.split("/")[1];
  //   const uniqueSuffix =
  //     Date.now() + "-" + Math.round(Math.random() * 1e9) + "." + extName;
  //   cb(null, file.fieldname + "-" + uniqueSuffix);
  // },
});

export const upload = multer({
  storage: multerConfig,
  limits: {
    fileSize: 25600,
  },
});
