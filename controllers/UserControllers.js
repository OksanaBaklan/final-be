/** @format */
import jwt from "jsonwebtoken";

import User from "../models/userModels.js";

export const createUser = async (req, res, next) => {
  const { userName, password, email } = req.body;

  const alreadyExist = await User.findOne({ email: email });
  if (alreadyExist !== null) {
    const err = new Error("Email already registered");
    err.statusCode = 400;
    throw err;
  }

  const user = new User({
    userName,
    email,
    hashedPassword: password,
  });
  await user.setAvatarURL(email);

  const newUser = await user.save();

  newUser.hashedPassword = undefined;

  res.status(201).json({ message: "User created" });
};

//current user
export const singleUserDetails = async (req, res, next) => {
  const { userId } = req.params;
  const result = await User.findById(userId);
  res.status(200).json(result);
};

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

    res.status(201).json({
      message: "logged in successfully",
      token: token,
      userName: user.userName,
      userId: user._id,
      avatar: user.avatar,
    });
  }
};

export const avatarHandler = async (req, res, next) => {
  const id = req.user._id;
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
