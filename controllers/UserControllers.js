/** @format */
import jwt from "jsonwebtoken";
import { imgNormalize } from "../helpers/imgNormalize.js";
import { renameFile } from "../helpers/renameFile.js";
import { sendEmail } from "../helpers/sendEmail.js";
import path from "path";
import User from "../models/userModels.js";
import cloudinary from "cloudinary";
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

  const subject = "Account created at Money Minder App";
  const plainText = `Welcome ${userName}! Your account has been created with use`;
  const htmlText = `
                          <h2>Welcome ${userName}!</h2>
                          <br/>
                          <p>Welcome to Money Minder App. Your  account has been created successfully</p>
                          <p>Please click on the below link to confirm your email and activate your account</p>
                          <a href="${SITE_NAME}/verify/${verificationToken}">Click to confirm registration</a>`;

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
      verified: newUser.verified,
    },
  });
};

//email confirm
export const emailConfirmationHandler = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    const err = new Error("Missing required field email");
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findOne({ email });

  // console.log(user);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 400;
    throw err;
  }
  const { verified, verificationToken } = user;
  const { SENDER_EMAIL, SITE_NAME } = process.env;

  if (verified) {
    const err = new Error("The verification already done");
    err.statusCode = 400;
    throw err;
  }
  const data = {
    to: SENDER_EMAIL,
    subject: "Confirmation of registration",
    html: `<a target="_blank" href="${SITE_NAME}/verify/${verificationToken}">Click to confirm registration</a>`,
    //html: `<a target="_blank" href="${LOCAL_HOST}:${PORT}/api/users/verify/${user.verificationToken}">Click to confirm registration</a>  `,
  };
  await sendEmail(data);

  res.status(200).json("Verification email sent");
};

// verify token
export const verificationTokenHandler = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw new NotFound("User not found");
  }
  await User.findByIdAndUpdate(user._id, {
    verificationToken: null,
    verified: true,
  });

  res.status(200).json("Verification successful");
};

//current user
export const singleUserDetails = async (req, res, next) => {
  const { _id } = req.user;
  // console.log(_id);
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

//logout user
export const logoutHandler = async (req, res, next) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate({ _id }, { token: null });

  res.status(204).json();
};

//set avatar
export const avatarHandler = async (req, res, next) => {
  const id = req.user._id;
  console.log(req.file);
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
    data: { avatar: user.avatarURL },
  });
};

export const avatarUploader = async (req, res, next) => {
  const { _id } = req.user;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });

  cloudinary.v2.uploader.upload(
    req.file.path,

    { public_id: Date.now() + req.file.filename },
    async (err, result) => {
      if (err) {
        const error = new Error("Failed to upload the Image");
        error.statusCode = 400;
        throw error;
      }
      fs.unlinkSync(req.file.path);

      const user = User.findByIdAndUpdate(
        _id,
        { avatarURL: result.url },
        { new: true }
      );
      // console.log(user);

      res.status(200).json({
        message: "Image updated",
        data: { avatar: user._update.avatarURL },
      });
    }
  );
};
