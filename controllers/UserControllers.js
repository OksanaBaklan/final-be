/** @format */
import jwt from "jsonwebtoken";
import { imgNormalize } from "../helpers/imgNormalize.js";
import { renameFile } from "../helpers/renameFile.js";
import { sendEmail } from "../helpers/sendEmail.js";
import path from "path";
import User from "../models/userModels.js";
import fs from "fs";

//create user
export const createUser = async (req, res, next) => {
  const { userName, password, email } = req.body;
  const alreadyExist = await User.findOne({ email: email });
  if (alreadyExist !== null) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }
  const { SITE_NAME } = process.env;

  const verificationToken = await Date.now();

  const user = new User({
    userName,
    email,
    hashedPassword: password,
    verificationToken,
  });
  await user.setAvatarURL(email);

  const newUser = await user.save();
  console.log(newUser.verificationToken);

  newUser.hashedPassword = undefined;

  const subject = "Account created at FINANCE-APP";
  const plainText = `Welcome ${userName}! Your account has been created with use`;
  const htmlText = `
                          <h2>Welcome ${userName}!</h2>
                          <br/>
                          <p>Welcome to wallet-app. Your  account has been created successfully</p>
                          <p>Please click on the below link to confirm your email and activate your account</p>
                          <a href="${SITE_NAME}/confirm-email/${verificationToken}">Confirm</a>`;

  const emailStatus = await sendEmail(email, subject, plainText, htmlText);
  if (!emailStatus) {
    const err = new Error("Failed to send email");
    err.statusCode = 400;
    throw err;
  }

  res.status(201).json({
    message: "User created",
    data: {
      _id: newUser._id,
      userName: newUser.userName,
      email: newUser.email,
      avatar: newUser.avatarURL,
      verify: newUser.verify,
    },
  });
};

//current user
export const singleUserDetails = async (req, res, next) => {
  const { _id } = req.user;
  console.log(_id);
  const user = await User.findById(_id);

  res.status(200).json({
    message: `User data '${new Date()}'`,
    data: {
      token: user.token,
      email: user.email,
      userName: user.userName,
      avatar: user.avatarURL,
      balance: user.balance,
      transactionCategories: user.transactionCategories,
    },
  });
};

//login user
export const loginHandler = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("Email or password is wrong");
  }
  if (!user.verified) {
    return res.status(400).send("Please confirm your email first!");
  }

  const passwordCompare = await user.comparePassword(password);
  if (!passwordCompare) {
    return res.status(400).send("Invalid Credentials");
  } else {
    const JWT_SECRET_KEY = process.env.SECRET_KEY;

    const payload = {
      email: email,
      userName: user.userName,
      userId: user._id,
    };

    const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 3600 });
    const { _id } = user;
    await User.findByIdAndUpdate(_id, { token });

    res.status(201).json({
      message: "logged in successfully",
      data: {
        token,
        email: user.email,
        userName: user.userName,
        avatar: user.avatarURL,
        balance: user.balance,
        transactionCategories: user.transactionCategories,
      },
    });
  }
};

export const logoutHandler = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate({ _id }, { token: null });

  res.status(204).json();
};

export const avatarHandler = async (req, res, next) => {
  const id = req.user._id;
  console.log("df");
  const { path: tempUpload, filename } = req.file;
  const newFileName = await renameFile(filename, id);
  const fileUpload = await path.join(avatarsDir, newFileName);
  await imgNormalize(tempUpload, "avatar");
  await fs.rename(tempUpload, fileUpload);
  const avatarURL = path.join("./public/avatars", newFileName);
  await User.findByIdAndUpdate(
    req.user._id,
    { avatarURL },
    {
      new: true,
      select: "-createdAt -updatedAt -password -token",
    }
  );

  res.status(200).json({
    message: "Image updated",
    data: { User: avatarURL },
  });
};
