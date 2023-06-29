/** @format */

import multer from "multer";
import { tempDir } from "../constants/directories.js";

const multerConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage: multerConfig,
  limits: {
    fileSize: 25600,
  },
});

