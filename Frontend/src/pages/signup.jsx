import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("signup"); // "signup" or "otp"
  const [loading, setLoading] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleOtpChange = (e) => setOtp(e.target.value);

  // Step 1: Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailForOtp(form.email);
        setStep("otp");
      } else alert(data.error || "Signup failed");
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailForOtp, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Signup complete! You can now login.");
        navigate("/login");
      } else alert(data.error || "OTP verification failed");
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = form.password && form.password === form.confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        {step === "signup" ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <h2 className="text-3xl font-bold text-indigo-600 text-center mb-6">Sign Up</h2>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
              required
            />
            {!passwordsMatch && form.confirmPassword && (
              <p className="text-red-500 text-sm">Passwords do not match</p>
            )}

            <button
              type="submit"
              disabled={loading || !passwordsMatch}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <h2 className="text-3xl font-bold text-indigo-600 text-center mb-6">Enter OTP</h2>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={handleOtpChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 shadow-sm transition duration-200"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-md"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
