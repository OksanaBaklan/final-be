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

userSchema.post("save", async (doc, next) => {
  try {
    const JWT_SECRET_KEY = process.env.SECRET_KEY;

    const payload = {
      email: doc.email,
      firstName: doc.firstName,
      userId: doc._id,
    };
    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 3600 });

    const subject = "Account created at POST-APP";
    const plainText = `Wellcome ${doc.firstName}! Your account has been created with use`;
    const htmlText = `
                          <h2>Welcome ${doc.firstName}!</h2>
                          <br/>
                          <p>Welcome to wallet-app. your  account has been created successfully</p>
                          <p>Please click on the below link to confirm your email and activate your account</p>
                          <a href="${SITE_NAME}/confirm-email/${token}">Confirm</a>`;

    const emailStatus = await sendEmail(
      doc.email,
      subject,
      plainText,
      htmlText
    );
    if (!emailStatus) {
      const err = new Error("Failed to send email");
      err.statusCode = 400;
      throw err;
    }
  } catch (err) {
    next(err);
  }
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

const User = mongoose.model("User", userSchema);

export default User;
