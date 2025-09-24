import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";
import { sendMail } from "../utils/mailer.js";


export const signup = async (req, res) => {
  const { email, password, skills = [] } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // OTP expires in 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = await User.create({
      email,
      password: hashed,
      skills,
      isVerified: false,
      otp,
      otpExpiry,
    });

    await sendMail(
      email,
      "Your OTP for Signup",
      `Your OTP is ${otp}. It will expire in 10 minutes.`
    );

    res.status(201).json({ message: "OTP sent to email", email: user.email });
  } catch (error) {
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
};


// EMAIL VERIFICATION
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user)
      return res.status(400).json({ error: "Invalid or expired verification token" });

    user.isVerified = true;
    user.verificationToken = null;
    await user.save();

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ error: "Verification failed", details: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (user.isVerified) return res.status(400).json({ error: "User already verified" });
    if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (user.otpExpiry < new Date()) return res.status(400).json({ error: "OTP expired" });

    // Mark user as verified
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Send welcome email (non-blocking)
    try {
      await sendMail(
        user.email,
        "Welcome to Inngest TMS!",
        `Hi ${user.email},\n\nWelcome aboard! We're excited to have you with us.`
      );
      console.log("Welcome email sent successfully.");
    } catch (err) {
      console.error("Failed to send welcome email:", err.message);
      // Don't block response if email fails
    }

    res.json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ error: "OTP verification failed", details: error.message });
  }
};

// export const verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ error: "User not found" });
//     if (user.isVerified) return res.status(400).json({ error: "User already verified" });
//     if (user.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
//     if (user.otpExpiry < new Date()) return res.status(400).json({ error: "OTP expired" });

//     // Mark user as verified
//     user.isVerified = true;
//     user.otp = null;
//     user.otpExpiry = null;
//     await user.save();

//     // Send welcome email (non-blocking)
//     try {
//       await sendMail(
//         user.email,
//         "Welcome to Inngest TMS!",
//         `Hi ${user.email},\n\nWelcome aboard! We're excited to have you with us.`
//       );
//       console.log("Welcome email sent successfully.");
//     } catch (err) {
//       console.error("Failed to send welcome email:", err.message);
//       // Don't block response if email fails
//     }

//     res.json({ message: "Email verified successfully! You can now login." });
//   } catch (error) {
//     res.status(500).json({ error: "OTP verification failed", details: error.message });
//   }
// };


// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isVerified)
      return res.status(403).json({ error: "Please verify your email first." });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
    });

    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ error: "Logout failed", details: error.message });
  }
};

// UPDATE USER (ADMIN ONLY)
export const updateUser = async (req, res) => {
  const { skills = [], role, email } = req.body;
  try {
    if (req.user?.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "User not found" });

    await User.updateOne(
      { email },
      { skills: skills.length ? skills : user.skills, role }
    );
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Update failed", details: error.message });
  }
};

// GET ALL USERS (ADMIN ONLY)
export const getUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed", details: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    await sendMail(
      email,
      "Password Reset OTP",
      `Your password reset OTP is ${otp}. It will expire in 10 minutes.`
    );

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send OTP", details: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user.resetOtp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (user.resetOtpExpiry < new Date()) return res.status(400).json({ error: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully! You can now login." });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password", details: error.message });
  }
};
