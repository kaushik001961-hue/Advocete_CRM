"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  Bell,
  User,
  LogOut,
} from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
}

function getPageTitle(pathname: string) {
  if (pathname === "/admin") {
    return "Dashboard";
  }

  if (pathname.startsWith("/admin/cases")) {
    return "Cases";
  }

  if (pathname.startsWith("/admin/clients")) {
    return "Clients";
  }

  if (pathname.startsWith("/admin/hearings")) {
    return "Hearings";
  }

  if (pathname.startsWith("/admin/calendar")) {
    return "Court Calendar";
  }

  if (pathname.startsWith("/admin/tasks")) {
    return "Tasks";
  }

  if (pathname.startsWith("/admin/documents")) {
    return "Documents";
  }

  if (pathname.startsWith("/admin/invoices")) {
    return "Invoices";
  }

  if (pathname.startsWith("/admin/expenses")) {
    return "Expenses";
  }

  if (pathname.startsWith("/admin/payments")) {
    return "Payments";
  }

  if (pathname.startsWith("/admin/advocates")) {
    return "Advocates";
  }

  if (pathname.startsWith("/admin/staff")) {
    return "Staff";
  }

  if (pathname.startsWith("/admin/users")) {
    return "User Management";
  }

  if (pathname.startsWith("/admin/reports")) {
    return "Reports & Analytics";
  }

  if (pathname.startsWith("/admin/audit-logs")) {
    return "Audit Logs";
  }

  if (pathname.startsWith("/admin/notifications")) {
    return "Notifications";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "Settings";
  }

  return "Admin";
}

export default function Topbar({
  onMenuClick,
}: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName =
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    "Administrator";

  const userInitial =
    userName.charAt(0).toUpperCase() || "A";

  const pageTitle = getPageTitle(pathname);

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">
      {/* =====================================================
          LEFT
      ====================================================== */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
          aria-label="Open navigation sidebar"
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-gray-800 sm:text-lg">
            {pageTitle}
          </h1>

          <p className="hidden text-xs text-gray-400 sm:block">
            Legal CRM Admin
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT
      ====================================================== */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="View notifications"
          title="Notifications"
        >
          <Bell size={19} />

          {/* Notification indicator */}
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
        </button>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-gray-200 sm:block" />

        {/* User information */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right md:block">
            <p className="text-xs text-gray-400">
              Welcome
            </p>

            <p className="max-w-[160px] truncate text-sm font-semibold text-gray-800">
              {userName}
            </p>
          </div>

          {/* Avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-sm">
            {userInitial || <User size={18} />}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-gray-200 sm:block" />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg p-2 text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200 sm:px-3"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={18} />

          <span className="hidden text-sm font-medium sm:inline">
            Logout
          </span>
        </button>
      </div>
    </header>
  );
}