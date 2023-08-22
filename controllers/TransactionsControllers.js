/** @format */

import User from "../models/userModels.js";
import Transaction from "../models/transaction.js";
import { joiTransactionValidation } from "../middleware/transactionValidation.js";
import { countTheBalance } from "../helpers/countTheBalance.js";
import { castNumberToTrType } from "../helpers/castNumberToTrType.js";

export const getAllTransactions = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const { _id, balance } = req.user;
  const skip = (page - 1) * limit;

  const transaction = await Transaction.find(
    { owner: _id },
    "-createdAt -updatedAt -year -month",
    { skip, limit: Number(limit) }
  ).sort({ date: -1 });

  const data = {
    balance: balance,
    transactions: [...transaction],
  };

  res.json(data);
};

export const createTransactions = async (req, res, next) => {
  const { error } = joiTransactionValidation.validate(req.body);
  if (error) {
    const err = new Error(error.message);
    err.statusCode = 400;
    throw err;
  }

  const { _id, balance } = req.user;
  const { amount, isIncome, date } = req.body;
  const transactionBalance = countTheBalance(isIncome, balance, amount);
  // console.log(transactionBalance);
  // console.log(isIncome);

  // const numberFromType = castNumberToTrType(amount, isIncome);

  // const trMadeLater = await Transaction.updateMany(
  //   { $and: [{ owner: _id }, { date: { $gt: date } }] },
  //   { $inc: { balance: numberFromType } }
  // );
  // if (trMadeLater.matchedCount > 0) {
  //   const trAfterNew = await Transaction.findOne({
  //     $and: [{ owner: _id }, { date: { $gt: date } }],
  //   });

  //   const oldBalanc =
  //     trAfterNew.balanisIncomece === undefined ? 0 : trAfterNew.balance;

  //   const quantityFromType =
  //     trAfterNew.amount === undefined || trAfterNew.isIncome === undefined
  //       ? 0
  //       : castNumberToTrType(trAfterNew.amount, trAfterNew.isIncome);

  //   const newOldTransaction = await Transaction.create({
  //     ...req.body,
  //     owner: _id,
  //     balance: oldBalanc - quantityFromType,
  //   });

  //   await User.findByIdAndUpdate(_id, { balance: transactionBalance });
  //   res.status(201).json(newOldTransaction);
  // } else {
  const newTransaction = await Transaction.create({
    ...req.body,
    owner: _id,
    balance: transactionBalance,
  });

  await User.findByIdAndUpdate(_id, { balance: transactionBalance });
  res.status(201).json(newTransaction);
  // }
};

// delete transaction by ID
export const deleteTransactionById = async (req, res, next) => {
  const { _id, balance } = req.user;
  const transactionId = req.params.transactionId;
  if (!transactionId) {
    const err = new Error("This transaction isn't exist");
    err.statusCode = 400;
    throw err;
  }
  // const user = await User.findById(_id);
  console.log(balance);
  const transaction = await Transaction.findOneAndRemove({
    _id: transactionId,
    owner: _id,
  });
  if (transaction) {
    const user = await User.findByIdAndUpdate(
      transaction.owner,
      {
        balance: transaction.isIncome
          ? balance - transaction.amount
          : balance + transaction.amount,
      },
      { new: true }
    );
    console.log(user.balance);

    return res
      .status(200)
      .json({ status: "success", code: 200, data: { balance: user.balance } });
  }
};

// update transaction by ID of user
export const editTransactionById = async (req, res, next) => {
  const { _id, balance } = req.user;
  // Here we are getting the updated amount and income type

  // We are getting the id of the transaction from params which we want to update
  const transactionId = req.params.transactionId;

  if (!transactionId) {
    const err = new Error("This transaction isn't exist");
    err.statusCode = 400;
    throw err;
  }

  const oneTransaction = await Transaction.findById(transactionId);
  const { amount, isIncome } = oneTransaction;

  console.log(
    " My old balance after deleting the old transaction amount",
    (isIncome ? balance - amount : balance + amount) + req.body.amount
  );

  const transaction = await Transaction.findByIdAndUpdate(
    transactionId,
    {
      isIncome: req.body.isIncome,

      balance: req.body.isIncome
        ? (isIncome ? balance - amount : balance + amount) +
          Number(req.body.amount)
        : (isIncome ? balance - amount : balance + amount) -
          Number(req.body.amount),

      amount: req.body.amount,
      comment: req.body.comment,
    },
    { new: true }
  );
  // console.log(Number(req.body.amount));

  const userBalance = await User.findByIdAndUpdate(
    _id,
    {
      balance: req.body.isIncome
        ? (isIncome ? balance - amount : balance + amount) +
          Number(req.body.amount)
        : (isIncome ? balance - amount : balance + amount) -
          Number(req.body.amount),
    },
    { new: true }
  );
  console.log(_id);

  if (transaction) {
    return res.status(200).json({
      status: "success",
      code: 200,
      data: { userBalance: userBalance.balance, transaction },
    });
  }
};

// get details of transaction by ID
export const getTransactionDetails = async (req, res, next) => {
  // const { _id } = req.user;
  const transactionId = req.params.transactionId;
  if (!transactionId) {
    const err = new Error("This transaction isn't exist");
    err.statusCode = 400;
    throw err;
  }

  const oneTransaction = await Transaction.findById(transactionId);

  if (!oneTransaction) {
    const err = new Error("Transaction not Found");
    err.statusCode = 404;
    throw err;
  }
  res.status(200).json(oneTransaction);
};
