/** @format */

import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      require: true,
      min: 0.01,
    },
    isIncome: {
      type: Boolean,
      require: true,
    },
    categoryId: {
      type: String,
    },
    date: {
      type: Number,
      require: true,
    },
    month: {
      type: Number,
    },
    year: {
      type: Number,
    },
    balance: {
      type: Number,
    },
    comment: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "user",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);
export default mongoose.model("Transaction", transactionSchema);
