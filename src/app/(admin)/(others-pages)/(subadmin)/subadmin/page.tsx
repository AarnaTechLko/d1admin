"use client";
import { useRouter } from "next/navigation";
// import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Eye, EyeOff } from "lucide-react"; // Lucide React icons
import { User, Mail, Lock } from "lucide-react";

import React, { useState } from "react";

export default function SignInForm() {
  // const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // const [isChecked, setIsChecked] = useState(false); // "Keep me logged in"
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Customer Support",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Handle input change

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/subadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials");
      } else {
        setSuccess("Add successful! Redirecting...");
        router.push("/view")
        // ✅ Store JWT token
        // if (isChecked) {
        //   localStorage.setItem("session_token", data.token); // Persist even after closing browser
        // } else {
        //   sessionStorage.setItem("session_token", data.token); // Remove after session ends
        // }

        // setTimeout(() => {
        //   router.push("/dashboard"); // Redirect to profile page
        // }, 2000);
      }
    } catch (err) {
      console.error("Signin error:", err);
      setError("Network error, please try again.");
    }
  };

  return (
    <>
      <div>

        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Sub Admin
        </h1>
      </div>
      <div className="flex flex-col flex-1 w-full  p-6
 bg-white dark:bg-gray-800 ">

        <form onSubmit={handleSubmit}>
        <div className="space-y-6 w-full mx-auto">
  {/* Username and Email - Two Columns */}
  <div className="grid grid-cols-12 gap-6">
    {/* Username Field */}
    <div className="col-span-6 relative">
      <Label>
        User Name <span className="text-error-500">*</span>
      </Label>
      <User className="absolute my-3 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        className="pl-12 py-2 w-full"
        placeholder="John"
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        required
      />
    </div>

    {/* Email Field */}
    <div className="col-span-6 relative">
      <Label>
        Email <span className="text-error-500">*</span>
      </Label>
      <Mail className="absolute my-3 left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        className="pl-12 py-2 w-full"
        placeholder="info@gmail.com"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />
    </div>
  </div>

  {/* Password and Role - Two Columns */}
  <div className="grid grid-cols-12 gap-6">
    {/* Password Field */}
    <div className="col-span-6 relative">
      <Label>
        Password <span className="text-error-500">*</span>
      </Label>
      <Lock className="absolute my-3 left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        className="pl-12 py-2 w-full"
        type={showPassword ? "text" : "password"}
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        className="absolute z-30 my-3 -translate-y-1/2 cursor-pointer right-4 top-1/2"
      >
        {showPassword ? (
          <Eye className="fill-gray-500 dark:fill-gray-400" />
        ) : (
          <EyeOff className="fill-gray-500 dark:fill-gray-400" />
        )}
      </span>
    </div>

    {/* Role Selection */}
    <div className="col-span-6">
      <Label>
        Role <span className="text-error-500">*</span>
      </Label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-300"
        required
      > 
        <option value="Executive">Manager</option>
        <option value="Customer Support">Customer Support</option>
        <option value="Executive">Executive Level 1</option>
        <option value="Executive">Executive Level 2</option>
      </select>
    </div>
  </div>

  {/* Error & Success Messages */}
  {error && <p className="text-error-500">{error}</p>}
  {success && <p className="text-green-500">{success}</p>}

  {/* Submit Button Centered */}
  <div className="flex justify-center">
    <Button className="w-1/2" size="sm" type="submit">
      Add Admin
    </Button>
  </div>
</div>

        </form>


      </div>


    </>
  );
}
