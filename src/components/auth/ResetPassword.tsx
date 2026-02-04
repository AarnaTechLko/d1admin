"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import d1 from "@/public/images/signin/d1.png";

export default function ResetPassword() {
  const router = useRouter();  
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ✅ Token validation
  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setLoading(false);
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Reset failed");

    setSuccess("Password reset successfully! Redirecting...");
    setTimeout(() => router.push("/signin"), 2000);
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Something went wrong");
    }
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-500">Validating link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div className="flex flex-1 items-center justify-center bg-white px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full overflow-hidden">
              <Image src={d1} alt="D1" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Reset Password
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter your new password below
            </p>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
