"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import d1 from "@/public/images/img/d1.png";
import { NEXT_PUBLIC_AWS_S3_BUCKET_LINK } from "@/lib/constants";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [role, setRole] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); // ✅ Spinner state

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function () {
        window.history.pushState(null, "", window.location.href);
      };
    }
    const storedEmail = sessionStorage.getItem("email");
    const storedUser = sessionStorage.getItem("username");
    const storedImage = sessionStorage.getItem("image");
    const storedRole = sessionStorage.getItem("role");

    if (storedEmail) setEmail(storedEmail);
    if (storedUser) setUser(storedUser);
    if (storedImage) setImage(storedImage);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true); // ✅ Start spinner
      await fetch("/api/logout", { method: "POST" });

      localStorage.removeItem("session_token");
      sessionStorage.removeItem("session_token");
      localStorage.removeItem("user_id");
      sessionStorage.removeItem("user_id");
      localStorage.removeItem("image");
      sessionStorage.removeItem("image");

      // ✅ Redirect after logout
      router.push("/signin");
      window.location.href = "/signin";
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false); // ✅ Stop spinner if error occurs
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle"
      >
        <span className="mr-3 overflow-hidden rounded-full">
          <Image
            width={32}
            height={44}
            src={
              !image || image.endsWith("/null")
                ? d1
                : `${NEXT_PUBLIC_AWS_S3_BUCKET_LINK}/${image}`
            }
            alt="User"
          />
        </span>
        <span className="block mr-1 font-medium text-theme-sm">{user}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div>
          <span className="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {user || "D1 Notes"}
          </span>

          <span className="my-0.5 block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
            {role || "Admin"}
          </span>

          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            {email || "randomuser@pimjo.com"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <a
              href="/changepassword"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Change Password
            </a>
          </li>
        </ul>

        <button
          onClick={handleLogout}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-3 px-3 py-2 mt-3 font-medium rounded-lg group text-theme-sm transition-all
            ${
              loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "text-red-600 hover:bg-red-100 dark:hover:bg-red-900 dark:hover:text-red-300"
            }`}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
              <span>Signing out...</span>
            </>
          ) : (
            "Sign Out"
          )}
        </button>
      </Dropdown>
    </div>
  );
}
