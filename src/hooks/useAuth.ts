"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  name?: string;
  // Add other user properties if needed
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null); // ✅ Specify type
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me"); // API to get user details
        if (!response.ok) throw new Error("Not authenticated");
        const data: User = await response.json();
        setUser(data);
      } catch {
        setUser(null); // ✅ Removed unused `error`
      }
    };

    fetchUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" }); // Invalidate session
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err); // ✅ Keep error here for debugging
    }
  };

  return { user, logout };
};
