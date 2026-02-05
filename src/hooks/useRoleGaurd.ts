// // hooks/useRoleGuard.ts
// import { useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { roleBasedAccess } from "@/utils/roleAccess";
// import toast from "react-hot-toast";

// export const useRoleGuard = () => {
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     const role = sessionStorage.getItem("role");

//     if (role) {
//       const allowedRoutes = roleBasedAccess[role] || [];
//       const basePath = pathname.split("?")[0];

//       if (!allowedRoutes.includes(basePath)) {
//         toast.error("You do not have access to this page!");
//         router.push("/access-denied"); // Or redirect to dashboard
//       }
//     }
//   }, [pathname]);
// };


// hooks/useRoleGuard.ts
// import { useEffect } from "react";
// import { usePathname, useRouter } from "next/navigation";
// import { roleBasedAccess } from "@/utils/roleAccess";
// import toast from "react-hot-toast";

// export const useRoleGuard = () => {
//   const pathname = usePathname();
//   const router = useRouter();

//   useEffect(() => {
//     const role = sessionStorage.getItem("role");

//     if (role) {
//       const allowedRoutes = roleBasedAccess[role];

//       // Extract base path (ignore query string)
//       const basePath = pathname.split("?")[0];

//       // If wildcard (*), allow access to everything
//       if (allowedRoutes === "*" || allowedRoutes?.includes(basePath)) {
//         return; // access granted
//       }

//       // If not allowed, redirect
//       toast.error("You do not have access to this page!");
//       router.push("/access-denied"); // Or "/dashboard"
//     }
//   }, [pathname, router]);
// };

"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { roleBasedAccess } from "@/utils/roleAccess";
import toast from "react-hot-toast";

export const useRoleGuard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until session is fully loaded
    if (status === "loading") return;

    if (!session?.user?.role) {
      router.push("/signin");
      return;
    }

    const allowedRoutes = roleBasedAccess[session.user.role];
    if (allowedRoutes === "*") return;

    const isAllowed = allowedRoutes.some((route) =>
      route.endsWith("*")
        ? pathname.startsWith(route.replace("*", ""))
        : route === pathname
    );

    if (!isAllowed) {
      toast.error("Access denied");
      router.push("/unauthorized");
    }
  }, [session, status, pathname, router]);
};
