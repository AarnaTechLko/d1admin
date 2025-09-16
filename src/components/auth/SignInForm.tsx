"use client";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Eye, EyeOff } from "lucide-react"; // Lucide React icons
import React, { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function SignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
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
        credentials: "include", // ✅ Ensures cookies are sent
      });

      const data = await res.json();
      console.log("signin", data);
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials");
      }

      if (!data.token || !data.user_id) {
        throw new Error("Authentication failed. Please try again.");
      }

      setSuccess("Login successful! Redirecting...");

      // ✅ Store token & user_id securely

      sessionStorage.setItem("session_token", data.token); // Session-based login
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

      if (!data.image){
        router.push("/profileimage");
        return;
      }

      sessionStorage.setItem("image", data.image);


      const redirectPath = data.role === "Customer Support" ? "/ticket" : "/dashboard";

      // sessionStorage.setItem("profile_image", data.profile_image)

      // setTimeout(() => {
      router.push(redirectPath);
      // }, 2000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Signin error:", err.message);
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="flex flex-col flex-1 mt-5 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Admin Login !
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to login!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>Email <span className="text-error-500">*</span></Label>
                <Input
                  placeholder="info@gmail.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label>Password <span className="text-error-500">*</span></Label>
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
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <Eye className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeOff className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={isChecked}
                    onChange={() => setIsChecked(!isChecked)}
                  />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    Keep me logged in
                  </span>
                </div>
                <Link href="/reset-password" className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400">
                  Forgot password?
                </Link>
              </div> */}

              {/* Display Error Message */}
              {error && <p className="text-error-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}

              <div>
                <Button
                  className="w-full flex items-center justify-center space-x-2"
                  size="sm"
                  type="submit"
                  disabled={loading}
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  <span>{loading ? "Signing in..." : "Sign in"}</span>
                </Button>
              </div>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
}
