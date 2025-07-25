import React from "react";
import { Bell } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
  onClick: () => void;
  isActive?: boolean;
  className?: string;
}

export function NotificationBadge({ 
  count, 
  onClick, 
  isActive = false, 
  className = "" 
}: NotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg transition-all duration-200 ${
        isActive 
          ? "bg-blue-100 text-blue-600" 
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      } ${className}`}
    >
      <Bell className="w-6 h-6" />
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium animate-pulse">
          {count > 99 ? "99+" : count}
        </span>
      )}
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] animate-ping opacity-75"></span>
      )}
    </button>
  );
}
