// import GridShape from "@/components/common/GridShape";
// import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import d1 from "@/public/images/signin/d1.png";
// import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
// import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      {/* <ThemeProvider> */}
      <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
        {children}
        <div className="lg:w-1/2 w-full h-full relative">
          {/* Background Image */}
          <Image
            src={d1}
            alt="Background"
            objectFit="cover" // Ensures it covers without distortion
            priority // Optimizes loading
          />
         
        </div>
       
      </div>
      {/* </ThemeProvider> */}
    </div>
  );
}
