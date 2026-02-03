import ForgetPassword from "@/components/auth/ForgetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - D1notes",
  description: "Reset your password for D1notes",
};

export default function ForgetPasswordPage() {
  return <ForgetPassword />;
}
 