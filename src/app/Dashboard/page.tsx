import { Outfit } from "next/font/google";
import "./globals.css";
// import SignInForm from "@/app/auth/SignInForm"
import { SidebarProvider } from "@/context/SidebarContext";
// import { ThemeProvider } from "@/context/ThemeContext";

const outfit = Outfit({
  variable: "--font-outfit-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} dark:bg-gray-900`}>
       {/* <SignInForm/> */}
          <SidebarProvider>{children}</SidebarProvider>
      
      </body>
    </html>
  );
}
