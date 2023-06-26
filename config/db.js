/** @format */

import mongoose from "mongoose";

const connectDB = async () => {
  const MONGO_URI = process.env.DB_HOST;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB connected");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};
export default connectDB;
