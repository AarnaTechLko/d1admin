"use client";

import { Bell } from "lucide-react";

export default function NotificationBell({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center
                 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />

      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-600 text-white
                     min-w-[18px] h-[18px] rounded-full text-xs
                     flex items-center justify-center font-bold"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
