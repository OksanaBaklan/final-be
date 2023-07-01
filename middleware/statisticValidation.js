/** @format */

import Joi from "joi";

export const joiStatisticValidation = Joi.object({
  year: Joi.number().min(1000).max(9999).required(),
  month: Joi.number().min(1).max(12).required(),
});
