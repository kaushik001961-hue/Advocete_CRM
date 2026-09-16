"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export default function LogoutButton({
  className = "",
  showText = true,
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition ${className}`}
      title="Sign out"
    >
      <LogOut size={18} className="shrink-0" />
      {showText && <span>Logout</span>}
    </button>
  );
}