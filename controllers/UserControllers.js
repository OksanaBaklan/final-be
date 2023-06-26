/** @format */

import User from "../models/userModels.js";

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

