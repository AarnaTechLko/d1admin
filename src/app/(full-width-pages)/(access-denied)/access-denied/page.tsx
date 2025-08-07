// app/access-denied/page.tsx

"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/button/Button";
import { Lock } from "lucide-react"; // Optional icon

export default function AccessDeniedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Lock className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-800 dark:text-white">
        Access Denied
      </h1>
      <p className="mt-2 text-gray-600 dark:text-gray-300">
        You do not have permission to view this page.
      </p>
      <Button className="mt-6" onClick={() => router.push("/signin")}>
        Go Back to Login Page
      </Button>
    </div>
  );
}
