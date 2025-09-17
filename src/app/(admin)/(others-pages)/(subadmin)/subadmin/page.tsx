"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { countryCodesList } from '@/lib/constants';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Eye, EyeOff, User, Mail, Lock, Loader2 } from "lucide-react";
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

export default function CreateSubAdminWithRole() {
  useRoleGuard();
  const router = useRouter();

  // const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  // const [photoUploading, setPhotoUploading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  // const [countries, setCountries] = useState<{ shortname: string; phonecode: string }[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    street: "",
    phone_number: "",
    country_code: "",
    role: "Customer Support",
    image: "",
    birthday: "",
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

  const handleDateChange = (date: Date | null) => {
    if (!date) {
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];

    const updatedFormValues = {
      ...formData,
      birthday: formattedDate,
    };

    try {
      const birthDate = new Date(formattedDate);
      const today = new Date();

      let age = today.getFullYear() - birthDate.getFullYear();

      const hasBirthdayOccurredThisYear =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());

      if (!hasBirthdayOccurredThisYear) {
        age--;
      }

      const isUnder16Value = age < 16;

      if(isUnder16Value){
        Swal.fire("Invalid Birthday", "Please enter in a birthday that is 16 years old or older.", "error");
        return;
      }
    } catch (error) {
      console.error('Error calculating age in handleDateChange:', error);
    }

    setSelectedDate(date);
    setFormData(updatedFormValues);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if(!formData.birthday){
      Swal.fire("Birthday Required", "Please enter in a birthday that is 16 years old or older", "error");
      return;
    }


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
      "birthday",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        Swal.fire("Missing Field", `Please fill in ${field.replace("_", " ")}`, "warning");
        return;
      }
    }

    try {
      setLoading(true);

      // let newProfileImage = { key: '', signedUrl: '' };
      // if (profilePicFile) {
      //   //upload new image
      //   newProfileImage = await uploadImage(profilePicFile as File);
      // }


      // Step 1: Create subadmin
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

  // const handleImageClick = () => {
  //   if (fileInputRef.current) {
  //     fileInputRef.current.click();
  //   }
  // };

  // const handleImageChange = async () => {
  //   setPhotoUploading(true);
  //   const file = fileInputRef.current?.files?.[0];
  //   if (!file) {
  //     console.warn('No image file selected.');
  //     return;
  //   }

  //   //compress image if needed
  //   let currentFile = file;
  //   let currentQuality = 0.9;
  //   let compressed = new File([''], '');
  //   let maxFinalSizeMB = 1;
  //   while (true) {
  //     const options = {
  //       maxSizeMB: 0.5,
  //       maxWidthOrHeight: 1500,
  //       useWebWorker: true,
  //     };
  //     compressed = await imageCompression(currentFile, options);

  //     if (
  //       compressed.size / 1024 / 1024 <= maxFinalSizeMB ||
  //       currentQuality <= 0.2
  //     ) {
  //       break;
  //     }

  //     currentFile = compressed;
  //     currentQuality -= 0.1; // decrease quality and try again
  //   }

  //   setPhotoUploading(false);
  //   setImageUrlToCrop(URL.createObjectURL(compressed));
  //   setOpenCrop(true);
  // };

  // const fetchCountries = async () => {
  //   try {
  //     const res = await fetch("/api/countryphonecode");
  //     if (!res.ok) throw new Error("Failed to fetch countries");
  //     const data = await res.json();

  //     if (Array.isArray(data)) {
  //       setCountries(data);        setCountries(data);
  //     } else if (Array.isArray(data.countries)) {
  //       setCountries(data.countries);        setCountries(data.countries);
  //     } else {
  //       setCountries([]);        setCountries([]);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     setCountries([]);      setCountries([]);
  //   }
  // };

  // useEffect(() => {
  //   fetchCountries();
  // }, []);


  // ✅ Auto-assign role permissions when role changes
  useEffect(() => {
    const defaults = rolePermissionsMap[formData.role] || [];
    setSelectedPermissions(defaults);
  }, [formData.role]);

  if (loading) return <Loading />;

  return (

    <div>

    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 shadow-lg
       dark:border-gray-700 my-8"
    >
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Add Sub Admin
      </h1>


      {/* <div className="mb-6 flex flex-col items-center">
        <div
          className="mb-4 flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100"
          onClick={handleImageClick}
        >
          {formData.image ? (
            <img
              src={formData.image}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="mb-2 text-4xl">📷</div>
              <div className="text-sm">Add Photo</div>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={handleImageClick}
          className="rounded-full border border-blue-200 bg-blue-50 px-6 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
        >
          {photoUploading ? 'Uploading...' : 'Add Profile Image'}
        </button>
        {formData.image && (
          <p className="mt-2 text-sm text-red-500">{formData.image}</p>
        )}
      </div> */}


      {/* Username & Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative ">
          <Label>
          Name <span className="text-error-500">*</span>
          </Label>
          <User className="absolute left-3 top-1/2 transform translate-y-1 text-gray-400" />
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

      </div>

      {/* Phone & Birthdate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
              {countryCodesList.map(item => (
                <option key={item.id} value={item.code}>
                  {item.code} ({item.country})
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

      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div> */}

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
        <Button type="submit" className="w-1/2 py-2 flex items-center justify-center gap-2" disabled={loading}>
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
    
        {/* Crop Modal
        {openCrop && imageUrlToCrop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Crop Your Image</h3>
              <CropEasy
                photoUrl={imageUrlToCrop}
                //Use email for now
                session={}
                setOpenCrop={setOpenCrop}
                handleCropImage={handleCropImage}
              />
            </div>
          </div>
        )} */}

    </div>

  );
}
