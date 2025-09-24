import mongoose from "mongoose";

// models/user.js
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user", enum: ["user", "moderator", "admin"] },
  skills: [String],
  isVerified: { type: Boolean, default: false },       // NEW: email verification status
  isVerified: { type: Boolean, default: false },
  otp: { type: String },           // store OTP
  otpExpiry: { type: Date },       // optional: OTP expiration time
// NEW: token for email verification
  resetOtp: { type: String },
  resetOtpExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
});


export default mongoose.model("User", userSchema);