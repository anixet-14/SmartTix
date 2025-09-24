import { sendMail } from "./utils/mailer.js";

(async () => {
  try {
    await sendMail(
      "ganiket957@gmail.com",
      "Test Email",
      "This is a test email from Nodemailer."
    );
    console.log("Test mail sent successfully!");
  } catch (err) {
    console.error("Mail sending failed:", err);
  }
})();
