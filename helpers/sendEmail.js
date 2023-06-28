/** @format */

import sendGrid from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

export const sendEmail = async (email, subject, plainText, htmlText) => {
  try {
    const { SENDGRID_API_KEY, SENDER_EMAIL } = process.env;
    sendGrid.setApiKey(SENDGRID_API_KEY);
    const message = {
      to: email,
      from: {
        name: "CREATE",
        email: SENDER_EMAIL,
      },
      subject: subject,
      text: plainText,
      html: htmlText,
    };
    const result = await sendGrid.send(message);
    console.log(result[0].statusCode);
    if (result[0].statusCode === 202) return true;
  } catch (error) {
    throw new Error(error.message);
  }
};
