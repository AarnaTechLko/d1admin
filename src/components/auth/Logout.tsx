
"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call backend to clear HttpOnly cookies
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      // ✅ Clear sessionStorage
      sessionStorage.removeItem("session_token");
      sessionStorage.removeItem("user_id");

      // ✅ Redirect to login
      router.push("/signin");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Logout
    </button>
  );
}

