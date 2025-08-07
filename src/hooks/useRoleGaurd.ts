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
      const allowedRoutes = roleBasedAccess[role] || [];
      const basePath = pathname.split("?")[0];

      if (!allowedRoutes.includes(basePath)) {
        toast.error("You do not have access to this page!");
        router.push("/access-denied"); // Or redirect to dashboard
      }
    }
  }, [pathname]);
};
