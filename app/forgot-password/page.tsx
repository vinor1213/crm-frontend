"use client";

import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail, Lock, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      console.log("📨 OTP sent to:", email);
      toast.success("OTP sent to your email!");
      setStep(2);
      setLoading(false);
    }, 1000);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== "123456") {
      toast.error("Invalid OTP! Try 123456 for demo.");
      return;
    }
    toast.success("OTP verified successfully!");
    setStep(3);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    console.log("✅ Password changed for:", email);
    toast.success("Password changed successfully!");
    setTimeout(() => {
      window.location.href = "/login";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-blue-100 p-8 transition-all">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 text-white p-3 rounded-full mb-3">
            {step === 1 ? <Mail className="w-6 h-6" /> : step === 2 ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Change Password"}
          </h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            {step === 1 && "Enter your registered email to receive an OTP."}
            {step === 2 && "Enter the OTP sent to your email."}
            {step === 3 && "Enter your new password below."}
          </p>
        </div>

        {/* Step 1 – Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="flex items-center border rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition">
                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-gray-700 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2 – OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 text-sm"
                placeholder="Enter 6-digit OTP"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition"
            >
              Verify OTP
            </button>
          </form>
        )}

        {/* Step 3 – Change Password */}
        {step === 3 && (
          <form onSubmit={handleChangePassword} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 text-sm"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 text-sm"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-medium transition"
            >
              Change Password
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center mt-5">
          <a href="/login" className="text-blue-600 hover:underline text-sm font-medium">
            Back to Login
          </a>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
}
