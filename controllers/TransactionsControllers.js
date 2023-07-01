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

  const numberFromType = castNumberToTrType(amount, isIncome);

  const trMadeLater = await Transaction.updateMany(
    { $and: [{ owner: _id }, { date: { $gt: date } }] },
    { $inc: { balance: numberFromType } }
  );

  if (trMadeLater.matchedCount > 0) {
    const trAfterNew = await Transaction.findOne({
      $and: [{ owner: _id }, { date: { $gt: date } }],
    });

    const oldBalanc = trAfterNew.balance === undefined ? 0 : trAfterNew.balance;

    const quantityFromType =
      trAfterNew.amount === undefined || trAfterNew.isIncome === undefined
        ? 0
        : castNumberToTrType(trAfterNew.amount, trAfterNew.isIncome);

    const newOldTransaction = await Transaction.create({
      ...req.body,
      owner: _id,
      balance: oldBalanc - quantityFromType,
    });

    await User.updateOne({ _id }, { balance: transactionBalance });
    res.status(201).json(newOldTransaction);
  } else {
    const newTransaction = await Transaction.create({
      ...req.body,
      owner: _id,
      balance: transactionBalance,
    });

    await User.updateOne({ _id }, { balance: transactionBalance });
    res.status(201).json(newTransaction);
  }
};
