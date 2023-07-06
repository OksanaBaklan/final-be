/** @format */

export const countTheBalance = (isIncome, balance, amount) => {
  console.log(isIncome);
  if (isIncome === "true") {
    return (balance * 100 + amount * 100) / 100;
  } else {
    return (balance * 100 - amount * 100) / 100;
  }
  // return isIncome !== true
  //   ? (balance * 100 + amount * 100) / 100
  //   : (balance * 100 - amount * 100) / 100;
};
