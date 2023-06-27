/** @format */

import User from "../models/userModels.js";

export const createUser = async (req, res, next) => {
  try {
    const { email, password, userName } = req.body;

    const { SECRET_KEY, TOKEN_TERM, LOCAL_HOST, SITE_NAME, PORT } = process.env;
    const verificationToken = Date.now();
    const newUser = new User({
      email,
      userName,
      verificationToken,
    });
    await newUser.setPassword(password);
    await newUser.setAvatarURL(email);
    await newUser.save();
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Email already registered");
      err.statusCode = 400;
      throw err;
    }
    if (!user.verify) {
      const data = {
        to: email,
        subject: "Confirmation of registration",
        html: `<a target="_blank" href="${SITE_NAME}/verify/${verificationToken}">Click to confirm registration</a>`,
        //html: `<a target="_blank" href="${LOCAL_HOST}:${PORT}/api/users/verify/${user.verificationToken}">Click to confirm registration</a>  `,
      };
      await sendEmail(data);

      throw new Unauthorized(
        `User not validating, check '${email}' for 'Confirmation of registration' request`
      );
    }
    const passwordCompare = await user.comparePassword(password);
    if (!passwordCompare) {
      throw new Unauthorized("Email or password is wrong");
    }

    const { _id } = user;
    const payload = { id: _id };
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: `${TOKEN_TERM}`,
    });
    await User.findByIdAndUpdate(_id, { token });

    res.status(200).json({
      message: "You have logged in",
      data: {
        token,
        email: user.email,
        userName: user.userName,
        avatar: user.avatarURL,
        balance: user.balance,
        transactionCategories: user.transactionCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

//current user
export const singleUserDetails = async (req, res, next) => {
  try {
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
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};
