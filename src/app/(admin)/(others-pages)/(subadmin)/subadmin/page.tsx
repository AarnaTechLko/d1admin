"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";
import Loading from "@/components/Loading";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import Swal from "sweetalert2";

const permissionOptions = [
  { label: "Change Password", value: "changePassword" },
  { label: "Refund", value: "refund" },
  { label: "Monitor Activity", value: "monitorActivity" },
  { label: "View Finance", value: "viewFinance" },
  { label: "Access Ticket", value: "accessTicket" },
];

export default function CreateSubAdminWithRole() {
      useRoleGuard();
  
  const router = useRouter();

  // Admin creation
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Customer Support",
  });

  // Permission assignment
  // const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // const [userId, setUserId] = useState<string | null>(null);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (value: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(value)
        ? prev.filter((p) => p !== value)
        : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    Swal.fire("Invalid Email", "Please enter a valid email address.", "warning");
    return;
  }

   // ✅ Password validation
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passwordRegex.test(formData.password)) {
    Swal.fire(
      "Weak Password",
      "Password must be at least 6 characters long and include a letter, a number, and a special character.",
      "warning"
    );
    return;
  }
    try {
      // Step 1: Create subadmin
      const res = await fetch("/api/subadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create subadmin");
        setLoading(false);
        return;
      }

      const createdUserId = data.user_id || data.id || data.data?.id; // adjust according to your backend response
      if (!createdUserId) {
        setError("User ID not returned from server");
        setLoading(false);
        return;
      }
localStorage.setItem("user_id", createdUserId);

      // localStorage.setItem("user_id", createdUserId);
      // setUserId(createdUserId);

      // Step 2: Assign Role
      const roleRes = await fetch(`/api/role/update-permission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: createdUserId,
          role_name:  formData.role,
          permissions: selectedPermissions,
        }),
      });

      const roleResult = await roleRes.json();
      if (!roleRes.ok || !roleResult.success) {
        setError(roleResult.message || "Role assignment failed");
        setLoading(false);
        return;
      }

      setSuccess("Subadmin and role assigned successfully!");

      // Redirect after success
      setTimeout(() => {
        router.push("/view");
      }, 1500);

    } catch (err) {
      console.error("Error:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };
useEffect(() => {
  if (formData.role === "Customer Support") {
    setSelectedPermissions((prev) =>
      prev.includes("accessTicket") ? prev : [...prev, "accessTicket"]
    );
  } else {
    setSelectedPermissions((prev) =>
      prev.filter((perm) => perm !== "accessTicket")
    );
  }
}, [formData.role]);


  if (loading) return <Loading />;

  return (
    <form onSubmit={handleSubmit}   className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border
     border-gray-300 shadow-lg dark:border-gray-700 my-8">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Add Sub Admin
      </h1>

      {/* Username & Email */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Label>User Name <span className="text-error-500">*</span></Label>
          <User className="absolute left-3 top-1/2 transform translate-y-1 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="John"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleAdminChange}
            required
          />
        </div>

        <div className="relative">
          <Label>Email <span className="text-error-500">*</span></Label>
          <Mail className="absolute left-3 top-1/2 transform translate-y-1 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="info@gmail.com"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleAdminChange}
            required
          />
        </div>
      </div>

      {/* Password & Role */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <Label>Password <span className="text-error-500">*</span></Label>
          <Lock className="absolute left-3 top-1/2 transform translate-y-1 text-gray-400" />
          <Input
            className="pl-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleAdminChange}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform translate-y-1 cursor-pointer"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </span>
        </div>

        <div>
          <Label>Role <span className="text-error-500">*</span></Label>
          <select
            name="role"
            value={formData.role}
            onChange={handleAdminChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="Manager">Manager</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Executive Level 1">Executive Level</option>
            <option value="Tech">Tech</option>
          </select>
        </div>
      </div>

   

      {/* Permissions */}
      <div>
        <Label>Permissions</Label>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4 mt-2">
          {permissionOptions.map((perm) => (
            <label key={perm.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                value={perm.value}
                checked={selectedPermissions.includes(perm.value)}
                onChange={() => handleCheckboxChange(perm.value)}
              />
              {perm.label}
            </label>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {error && <p className="text-error-500">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      {/* Submit */}
      <div className="flex justify-center">
        <Button type="submit" className="w-1/2 py-2">
          Create Subadmin & Assign Role
        </Button>
      </div>
    </form>
  );
}
