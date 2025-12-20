"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { countryCodesList } from '@/lib/constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Eye, EyeOff, Loader2, User, Mail, Lock } from "lucide-react";
import Loading from "@/components/Loading";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import Swal from "sweetalert2";
import { FaCalendarAlt } from "react-icons/fa";

// Permissions
const permissionOptions = [
  { label: "Change Password", value: "change_password" },
  { label: "Refund", value: "refund" },
  { label: "Monitor Activity", value: "monitor_activity" },
  { label: "View Finance", value: "view_finance" },
  { label: "Access Ticket", value: "access_ticket" },
];

// Default permissions per role
const rolePermissionsMap: Record<string, string[]> = {
  "Customer Support": ["access_ticket", "change_password"],
  "Manager": ["refund", "access_ticket", "view_finance"],
  "Tech": ["monitor_activity", "view_finance", "access_ticket"],
  "Executive Level": [
    "access_ticket",
    "change_password",
    "refund",
    "monitor_activity",
    "view_finance",
  ],
};

// ✅ Client-safe password generator
const generateClientPassword = (length = 12) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@$!%*?";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
};

export default function CreateSubAdminWithRole() {
  useRoleGuard();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    street: "",
    phone_number: "",
    country_code: "+1",
    role: "Customer Support",
    image: "",
    birthday: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "phone_number") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) value = value.slice(0, 10);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleGeneratePassword = () => {
    const password = generateClientPassword();
    setFormData((prev) => ({ ...prev, password }));
    setShowPassword(true);
  };

  const handleDateChange = (date: Date | null) => {
    if (!date) return;

    const formattedDate = date.toISOString().split('T')[0];
    const updatedFormValues = { ...formData, birthday: formattedDate };

    try {
      const birthDate = new Date(formattedDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const hasBirthdayOccurred = today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
      if (!hasBirthdayOccurred) age--;
      if (age < 16) {
        Swal.fire("Invalid Birthday", "Please enter a birthday 16 years or older.", "error");
        return;
      }
    } catch (err) { console.error(err); }

    setSelectedDate(date);
    setFormData(updatedFormValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.birthday) {
      Swal.fire("Birthday Required", "Please enter a birthday 16 years or older", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire("Invalid Email", "Please enter a valid email address.", "warning");
      return;
    }

    /* const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 6 characters and include a letter, a number, and a special character.",
        "warning"
      );
      return;
    } */

    const requiredFields = ["username", "email", "password", "role", "country_code", "phone_number", "birthday"];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Swal.fire("Missing Field", `Please fill in ${field.replace("_", " ")}`, "warning");
        return;
      }
    }

    try {
      setLoading(true);
      const res = await fetch("/api/subadmin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create admin");
        return;
      }

      const createdUserId = data.user_id;
      if (!createdUserId) { setError("User ID not returned from server"); return; }

      const roleRes = await fetch("/api/subadmin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createdUserId,
          role_name: formData.role,
          ...selectedPermissions.reduce((acc, key) => ({ ...acc, [key]: 1 }), {}),
        }),
      });

      const roleResult = await roleRes.json();
      if (!roleRes.ok) { setError(roleResult.error || "Failed to assign permissions"); return; }

      setSuccess("Subadmin created and permissions assigned successfully!");
      setTimeout(() => router.push("/view"), 1500);
    } catch (err) {
      console.error(err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const defaults = rolePermissionsMap[formData.role] || [];
    setSelectedPermissions(defaults);
  }, [formData.role]);

  if (loading) return <Loading />;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 shadow-lg dark:border-gray-700 my-8 text-xs">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">Add Staff Member</h1>

        {/* Username & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          <div className="relative">
            <Label>Name <span className="text-error-500">*</span></Label>
            <User className="absolute left-3 top-1/2 transform  text-gray-400" />
            <Input className="pl-10" placeholder="John Doe" type="text" name="username" value={formData.username} onChange={handleAdminChange} required />
          </div>
          <div className="relative">
            <Label>Email <span className="text-error-500">*</span></Label>
            <Mail className="absolute left-3 top-1/2 transform  text-gray-400" />
            <Input className="pl-10" placeholder="info@gmail.com" type="email" name="email" value={formData.email} onChange={handleAdminChange} required />
          </div>

          {/* Password */}
          <div className="relative">
            <Label>Password <span className="text-error-500">*</span></Label>
            <Lock className="absolute left-3 top-1/2 transform  text-gray-400" />
            <Input className="pl-10 pr-28" type={showPassword ? "text" : "password"} name="password" placeholder="Enter password" value={formData.password} onChange={handleAdminChange} required />
            <span onClick={() => setShowPassword(!showPassword)} className="absolute right-20 top-1/2 transform  cursor-pointer text-gray-500">
              {showPassword ? <Eye /> : <EyeOff />}
              </span>
            <button type="button" onClick={handleGeneratePassword} className="absolute right-3 top-1/2 transform  text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Generate</button>
          </div>

          {/* Role */}
          <div>
            <Label>Role <span className="text-error-500">*</span></Label>
            <select name="role" value={formData.role} onChange={handleAdminChange} className="w-full p-2 border border-gray-300 rounded-md" required>
              {Object.keys(rolePermissionsMap).map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </div>

        {/* Phone & Birthdate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Phone <span className="text-error-500">*</span></Label>
            <div className="flex w-full">
              <select name="country_code" value={formData.country_code} onChange={handleAdminChange} className="w-28 text-center rounded-l-md border border-gray-300" required>
                {countryCodesList.map(item => <option key={item.id} value={item.code}>{item.code} ({item.country})</option>)}
              </select>
              <Input type="tel" name="phone_number" value={formData.phone_number} onChange={handleAdminChange} placeholder="xxxxxxxxxx" pattern="\d{10,}" minLength={10} maxLength={10} className="flex-1 rounded-l-none border border-gray-300" required />
            </div>
          </div>

          <div>
            <Label>Birthdate <span className="text-error-500">*</span></Label>
            <div className="relative w-full max-w-md mx-auto">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />
              <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="dd-MM-yyyy" placeholderText="Date of Birth" showMonthDropdown showYearDropdown dropdownMode="select" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-600 text-gray-700 placeholder-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500 transition-all duration-200" calendarClassName="rounded-md shadow-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800" required />
            </div>
          </div>
        </div> 

        {/* Permissions */}
        <div>
          <Label>Permissions for {formData.role}</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4 mt-2">
            {permissionOptions.map((perm) => (
              <label key={perm.value} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedPermissions.includes(perm.value)} readOnly />
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
          <Button type="submit" className="w-1/2 py-2 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <>
              <Loader2 className="animate-spin" size={16} />
              <span>Processing...</span>
            </> : "Create Subadmin & Assign Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
