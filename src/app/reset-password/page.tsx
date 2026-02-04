//app/reset-password/page.tsx
import { Suspense } from "react";
import ResetPassword from "@/components/auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password - D1notes",
  description: "Reset your password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      }
    >
      <ResetPassword />
    </Suspense>
  );
}
 