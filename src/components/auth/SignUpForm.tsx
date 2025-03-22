"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import React, { useState } from "react";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
      } else {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => {
          window.location.href = "/signin";
        }, 2000);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Network error, please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Label>First Name</Label>
      <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

      <Label>Last Name</Label>
      <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

      <Label>Email</Label>
      <Input type="email" name="email" value={formData.email} onChange={handleChange} required />

      <Label>Password</Label>
      <Input type="password" name="password" value={formData.password} onChange={handleChange} required />

      {error && <p className="text-error-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}

      <Button type="submit">Sign Up</Button>
    </form>
  );
}
