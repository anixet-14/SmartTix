import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD);

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // remove spaces
      },
    });

    const info = await transporter.sendMail({
      from: `"SmartTix" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Mail error", error.message);
    throw error;
  }
};
