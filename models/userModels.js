/** @format */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import { emailRegExp, userNameRegExp } from "../constants/regExp.js";
import { transactionCategories } from "../constants/transactionCategories.js";
import { sendEmail } from "../helpers/sendEmail.js";
const { SECRET_KEY, TOKEN_TERM, LOCAL_HOST, SITE_NAME, PORT } = process.env;

export const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      match: userNameRegExp,
      required: true,
    },
    email: {
      type: String,
      match: emailRegExp,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      default: null,
    },
    verificationToken: {
      type: String,
      // required: [true, "Verify token is required"],
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    avatarURL: {
      type: String,
      default: "public\\no-picture.svg",
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactionCategories: {
      type: Array,
      default: transactionCategories,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
    },
  }
  // { versionKey: false, timestamps: true }
);

userSchema.pre("save", async function () {
  const saltRounds = 11;
  const salt = await bcrypt.genSalt(saltRounds);
  const newlyCreateHashedPswd = await bcrypt.hash(this.hashedPassword, salt);

  this.hashedPassword = newlyCreateHashedPswd;
});

userSchema.method("setAvatarURL", async function (email) {
  try {
    this.avatarURL = await gravatar.url(email, {
      protocol: "http",
      s: "250",
      d: "wavatar",
    });
  } catch (error) {
    console.log(error.message);
    throw new Error("Failed to generate Avatar image");
  }
});

userSchema.method("comparePassword", async function (password) {
  return await bcrypt.compareSync(password, this.hashedPassword);
});

const User = mongoose.model("user", userSchema);

export default User;
