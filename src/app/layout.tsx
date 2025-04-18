// import { Outfit } from "next/font/google";
// import "./globals.css";
// import { SidebarProvider } from "@/context/SidebarContext";
// // import { ThemeProvider } from "@/context/ThemeContext";

// const outfit = Outfit({
//   variable: "--font-outfit-sans",
//   subsets: ["latin"],
// });

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={`${outfit.variable} dark:bg-gray-900`}>
//           <SidebarProvider>{children}</SidebarProvider>
      
//       </body>
//     </html>
//   );
// }
"use client"
import { Outfit } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { SessionProvider } from "next-auth/react"; // ✅ Import this

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
      <body className={`${outfit.variable} dark:bg-gray-900 z-40`}>
        <SessionProvider> {/* ✅ Wrap children with SessionProvider */}
          <SidebarProvider>{children}</SidebarProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

