// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";

// const LogoutPage = () => {
//     const router = useRouter();

//     useEffect(() => {
//         const logout = async () => {
//             await fetch("/api/logout", { method: "POST" });
//             router.push("/signin"); // Redirect to login after logout
//         };

//         logout();
//     }, [router]);

//     return (
//         <div className="flex justify-center items-center min-h-screen">
//             <p>Logging out...</p>
//         </div>
//     );
// };

// export default LogoutPage;

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
      router.push("/login");
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

