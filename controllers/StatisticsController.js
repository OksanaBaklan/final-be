/** @format */

import { addAmountToCategoryObj } from "../helpers/statistic/addAmountToCategoryObj.js";
import { amountByCategory } from "../helpers/statistic/amountByCategory.js";
import { amountByTransactionType } from "../helpers/statistic/amountByTransactionType.js";
import { joiStatisticValidation } from "../middleware/statisticValidation.js";
import Transaction from "../models/transaction.js";

export const getStatistics = async (req, res, next) => {
  try {
    const { error } = joiStatisticValidation.validate(req.query);
    if (error) {
      const err = new Error(error.message);
      err.statusCode = 400;
      throw err;
    }
    const { _id, transactionCategories } = req.user;
    const { year, month } = req.query;

    const transactions = await Transaction.find({
      owner: _id,
      year: year,
      month: month,
    });
    // console.log(transactions);

    const transactionsExpence = transactions.filter(
      (transaction) => transaction.isIncome === false
    );

    const objAmountByCategory = amountByCategory(transactionsExpence);
    const categoryWithSum = addAmountToCategoryObj(
      transactionCategories,
      objAmountByCategory
    );
    const totalIncome = amountByTransactionType(transactions, true);
    const totalExpence = amountByTransactionType(transactions, false);

    const data = {
      category: categoryWithSum,
      total: { Expense: totalExpence, Income: totalIncome },
    };

    res.json(data);
  } catch (error) {
    next(error);
  }
};
