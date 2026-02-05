"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import { useSidebar } from "@/context/SidebarContext";
import NotificationDropdown from "@/components/headers/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";

import LL from "@/public/images/logo/LL.png";
import { useSession } from "next-auth/react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Toggle sidebar
  const handleToggle = () => {
    if (window.innerWidth >= 991) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  // Toggle app menu
  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  // Redirect to signin if user is not logged in
  useEffect(() => {
    if (status === "loading") return; // wait for session
    if (!session?.user) {
      router.push("/signin");
    }
  }, [session, status, router]);

  if (status === "loading") return null; // Don't render header until session loads

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar toggle */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 dark:border-gray-800 dark:text-gray-400 lg:h-11 lg:w-11"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <span className="text-lg">×</span> // simple close icon
            ) : (
              <span className="text-lg">&#9776;</span> // hamburger menu
            )}
          </button>

          {/* Logo */}
          <Link href="/" className="lg:hidden">
            <Image src={LL} width={32} height={32} alt="Logo" priority unoptimized className="dark:hidden" />
            <Image src={LL} width={32} height={32} alt="Logo" priority unoptimized className="hidden dark:block" />
          </Link>

          {/* Mobile application menu button */}
          <button
            onClick={toggleApplicationMenu}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" fill="currentColor">
              <circle cx="6" cy="12" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="18" cy="12" r="1.5" />
            </svg>
          </button>
        </div>

        {/* Application Menu & User Area */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0`}
        >
          <div className="flex items-center gap-3">
            {/* Notification */}
            <NotificationDropdown />
          </div>

          {/* User dropdown */}
          <UserDropdown />

          {/* Toast notifications */}
          <Toaster position="top-right" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
