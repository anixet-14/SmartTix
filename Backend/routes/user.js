import express from "express";
import {
  getUsers,
  login,
  signup,
  updateUser,
  logout,
  verifyOtp,
  forgotPassword,
  resetPassword,
  verifyEmail, // <-- import verifyEmail controller
} from "../controllers/user.js";

import { authenticate } from "../middlewares/auth.js";
const router = express.Router();

// Admin routes
router.post("/update-user", authenticate, updateUser);
router.get("/users", authenticate, getUsers);

// Auth routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);



// NEW: Email verification route
router.get("/verify/:token", verifyEmail);

export default router;
