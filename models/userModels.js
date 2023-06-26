/** @format */

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import gravatar from "gravatar";
import { emailRegExp, userNameRegExp } from "../constants/regExp.js";
import { transactionCategories } from "../constants/transactionCategories.js";

export const userSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: [true, " is required"],
    },
    token: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      match: emailRegExp,
      required: [true, " is required"],
      unique: true,
    },
    userName: {
      type: String,
      match: userNameRegExp,
      required: [true, " is required"],
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
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
    verify: {
      type: Boolean,
      default: false,
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.methods.setAvatarURL = async function (email) {
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
};
export default mongoose.model("User", userSchema, "User");
