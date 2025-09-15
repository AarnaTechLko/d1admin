"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
import Loading from "@/components/Loading";
import { useRoleGuard } from "@/hooks/useRoleGaurd";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Image as ImageIcon } from "lucide-react"; // ✅ add this at the top
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

export default function CreateSubAdminWithRole() {
  useRoleGuard();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<{ shortname: string; phonecode: string }[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Customer Support",
    country_code: "+91",   // ✅ default India
    phone_number: "",
    birthdate: "",
    image: "",
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAdminChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFormData({ ...formData, birthdate: date ? date.toISOString().split("T")[0] : "" });
  };

  const fetchCountries = async () => {
    try {
      const res = await fetch("/api/countryphonecode");
      if (!res.ok) throw new Error("Failed to fetch countries");
      const data = await res.json();

      if (Array.isArray(data)) {
        setCountries(data);
      } else if (Array.isArray(data.countries)) {
        setCountries(data.countries);
      } else {
        setCountries([]);
      }
    } catch (err) {
      console.error(err);
      setCountries([]);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    const defaults = rolePermissionsMap[formData.role] || [];
    setSelectedPermissions(defaults);
  }, [formData.role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire("Invalid Email", "Please enter a valid email address.", "warning");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!passwordRegex.test(formData.password)) {
      Swal.fire(
        "Weak Password",
        "Password must be at least 6 characters long and include a letter, a number, and a special character.",
        "warning"
      );
      return;
    }

    const requiredFields = [
      "username",
      "email",
      "password",
      "role",
      "country_code",
      "phone_number",
      "birthdate",
    ];
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
      if (!createdUserId) {
        setError("User ID not returned from server");
        return;
      }

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
      if (!roleRes.ok) {
        setError(roleResult.error || "Failed to assign permissions");
        return;
      }

      setSuccess("Subadmin created and permissions assigned successfully!");
      setTimeout(() => router.push("/view"), 1500);
    } catch (err) {
      console.error(err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 shadow-lg
       dark:border-gray-700 my-8"
    >
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Add Sub Admin
      </h1>

      {/* Username, Email, Password */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <Label>Name <span className="text-error-500">*</span></Label>
          <User className="absolute left-3 top-1/2 transform  text-gray-400" />
          <Input
            className="pl-10"
            placeholder="John Doe"
            type="text"
            name="username"
            value={formData.username}
            onChange={handleAdminChange}
            required
          />
        </div>

        <div className="relative">
          <Label>Email <span className="text-error-500">*</span></Label>
          <Mail className="absolute left-3 top-1/2 transform  text-gray-400" />
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

        <div className="relative">
          <Label>Password <span className="text-error-500">*</span></Label>
          <Lock className="absolute left-3 top-1/2 transform  text-gray-400" />
          <Input
            className="pl-10"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleAdminChange}
            required
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 transform  cursor-pointer"
          >
            {showPassword ? <Eye /> : <EyeOff />}
          </span>
        </div>
      </div>

      {/* Role, Phone & Birthdate */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Role <span className="text-error-500">*</span></Label>
          <select
            name="role"
            value={formData.role}
            onChange={handleAdminChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            {Object.keys(rolePermissionsMap).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Phone <span className="text-error-500">*</span></Label>
          <div className="flex w-full">
            {/* Country Code */}
            <select
              name="country_code"
              value={formData.country_code}
              onChange={handleAdminChange}
              className="w-28 text-center rounded-l-md border border-gray-300"
              required
            >
              {countries?.map((c, index) => (
                <option key={`${c.shortname}-${c.phonecode}-${index}`} value={`+${c.phonecode}`}>
                  {c.shortname} (+{c.phonecode})
                </option>
              ))}
            </select>


            {/* Phone Number */}
            <Input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleAdminChange}
              placeholder="9876543210"
              pattern="\d{10,}" // ✅ ensures only digits with at least 10 numbers
              minLength={10}    // ✅ extra safeguard
              maxLength={10}    // ✅ optional: international numbers can go up to 15 digits
              className="flex-1 rounded-l-none border border-gray-300"
              required
            />
          </div>
        </div>

        <div>
          <Label>Birthdate <span className="text-error-500">*</span></Label>
          <div className="relative w-full max-w-md mx-auto">
            {/* Calendar icon */}
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 dark:text-blue-400" />

            {/* DatePicker input */}
            <DatePicker
              selected={selectedDate}
              onChange={handleDateChange}
              dateFormat="dd-MM-yyyy"
              placeholderText="Date of Birth"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm cursor-pointer
                   focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-600
                   text-gray-700 placeholder-gray-400 
                   dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-500
                   transition-all duration-200"
              calendarClassName="rounded-md shadow-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-800"
              required
            />
          </div>


        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative">
          <Label>Profile Image</Label>
          <div className="flex items-center gap-3 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 shadow-sm bg-white dark:bg-gray-700 cursor-pointer hover:border-blue-500 transition">
            <ImageIcon className="text-gray-500 dark:text-gray-300 w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              name="image"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-700 dark:text-gray-200 bg-transparent border-0 focus:ring-0 file:hidden cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div>
        <Label>Permissions for {formData.role}</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-3 gap-x-4 mt-2">
          {permissionOptions.map((perm) => (
            <label key={perm.value} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm.value)}
                readOnly
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
        <Button
          type="submit"
          className="w-1/2 py-2 flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>Processing...</span>
            </>
          ) : (
            "Create Subadmin & Assign Role"
          )}
        </Button>
      </div>
    </form>
  );
}
