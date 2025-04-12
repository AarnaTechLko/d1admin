import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "D1notes",
  description: "D1notes",
};

export default function SignIn() {
  return <SignInForm />;
}
