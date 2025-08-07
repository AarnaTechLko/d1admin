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


// hooks/useRoleGuard.ts
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { roleBasedAccess } from "@/utils/roleAccess";
import toast from "react-hot-toast";

export const useRoleGuard = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("role");

    if (role) {
      const allowedRoutes = roleBasedAccess[role];

      // Grant full access for wildcard
      if (allowedRoutes === "*") return;

      const basePath = pathname.split("?")[0];

      const isAllowed = allowedRoutes?.some((route) => {
        if (route.endsWith("*")) {
          const base = route.replace("*", "");
          return basePath.startsWith(base);
        }

        if (route.includes("[") && route.includes("]")) {
          // Handle dynamic routes like /coach/[id]
          const regexPath = route.replace(/\[.*?\]/g, "[^/]+");
          const regex = new RegExp(`^${regexPath}$`);
          return regex.test(basePath);
        }

        return route === basePath;
      });

      if (!isAllowed) {
        toast.error("You do not have access to this page!");
        router.push("/access-denied");
      }
    }
  }, [pathname, router]);
};
