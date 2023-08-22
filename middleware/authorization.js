/** @format */

import jwt from "jsonwebtoken";
import User from "../models/userModels.js";

const { SECRET_KEY } = process.env;

export const authorizationHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    // console.log("authorization", authorization);
    if (!authorization) {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      throw error;
    }

    const [bearer, token] = authorization.split(" ");
    if (bearer !== "Bearer") {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      throw error;
    }

    jwt.verify(token, SECRET_KEY);
    const user = await User.findOne({ token });
    //console.log("token", jwt.verify(token, SECRET_KEY));
// console.log("USER info: ", user);
    if (!user) {
      const error = new Error("Not Authorized");
      error.statusCode = 401;
      throw error;
    }
    req.user = user;
    next();
  } catch (error) {
    if (!error.status) {
      error.status = 401;
      error.message = "Not authorized";
    }
    next(error);
  }
};
