import dotenv from "dotenv";
dotenv.config();

import { sendMail } from "./utils/mailer.js";

(async () => {
  try {
    await sendMail(
      "aniket.ag1408@gmail.com",
      "Test Mail",
      "Hello from Nodemailer & Mailtrap!"
    );
    console.log("Test mail sent successfully!");
  } catch (err) {
    console.error("Mail sending failed:", err);
  }
})();
