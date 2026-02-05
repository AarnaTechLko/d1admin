"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { signIn } from 'next-auth/react';
import Button from "@/components/ui/button/Button";
import { Eye, EyeOff } from "lucide-react";
import { FaSpinner } from "react-icons/fa";

export default function SignInForm() {
  const router = useRouter();

  // -----------------------
  // Login state
  // -----------------------
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // -----------------------
  // Handlers
  // -----------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid credentials");
      if (!data.token || !data.user_id) throw new Error("Authentication failed");

      setSuccess("Login successful! Redirecting...");

      // Store session data
      sessionStorage.setItem("session_token", data.token);
      sessionStorage.setItem("user_id", data.user_id);
      sessionStorage.setItem("username", data.username);
      sessionStorage.setItem("email", data.email);
      sessionStorage.setItem("role", data.role);
      sessionStorage.setItem("change_password", data.change_password);
      sessionStorage.setItem("monitor_activity", data.monitor_activity);
      sessionStorage.setItem("view_finance", data.view_finance);
      sessionStorage.setItem("access_ticket", data.access_ticket);

      console.log("Username: ", data.username);
      console.log("Image: ", data.image);

      //Starts the authentication flow using nextAuth and creates a session if it succeeds
      const response = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });


      if (!response || !response.ok) {
        throw new Error("Authentication failed. Please try again.");
      }

      if (!data.image){
        router.push("/profileimage");
        return;
      }

      sessionStorage.setItem("image", data.image);

      const redirectPath =
        data.role === "Customer Support" ? "/ticket" : "/dashboard";

      router.push(redirectPath);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="flex flex-col flex-1 mt-5 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="mb-5 sm:mb-8">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm sm:text-title-md">
            Admin Login!
          </h1>
          <p className="text-sm text-gray-500">
            Enter your email and password to login!
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              name="email"
              placeholder="info@gmail.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <Eye /> : <EyeOff />}
              </span>
            </div>
          </div>

          {/* Submit */}
          <Button
            className="w-full flex items-center justify-center gap-2 h-10"
            type="submit"
            disabled={loading}
          >
            {loading && <FaSpinner className="animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          {/* Forgot password link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push("/forget-password")}
              className="text-sm text-brand-500 hover:text-brand-600"
            >
              Forgot password?
            </button>
          </div>

          {/* Messages */}
          {error && <p className="text-error-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
        </form>
      </div>
    </div>
  );
}
