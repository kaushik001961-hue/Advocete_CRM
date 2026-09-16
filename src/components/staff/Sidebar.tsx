"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  Receipt,
  Wallet,
  CreditCard,
  BarChart3,
  Scale,
  Bell,
  LogOut,
  X,
} from "lucide-react";

type StaffSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function StaffSidebar({
  isOpen,
  onClose,
}: StaffSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);

  const items = [
    ["Dashboard", "/staff", LayoutDashboard],
    ["Cases", "/staff/cases", Briefcase],
    ["Clients", "/staff/clients", Users],
    ["Hearings", "/staff/hearings", CalendarDays],
    ["Court Calendar", "/staff/calendar", CalendarDays],
    ["Tasks", "/staff/tasks", ClipboardList],
    ["Documents", "/staff/documents", FileText],
    ["Invoices", "/staff/invoices", Receipt],
    ["Expenses", "/staff/expenses", Wallet],
    ["Payments", "/staff/payments", CreditCard],
    ["Reports & Analytics", "/staff/reports", BarChart3],
    ["eCourts Integration", "/staff/ecourts", Scale],
    ["Notifications", "/staff/notifications", Bell],
  ] as const;

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      onClose();

      await signOut({
        redirect: false,
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Staff logout failed:", error);

      // Fallback in case client-side navigation fails.
      window.location.href = "/login";
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-64 flex-col
        bg-slate-950 text-slate-300
        border-r border-slate-800
        transition-transform duration-300
        lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="flex h-[86px] shrink-0 items-center justify-between border-b border-slate-800 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
            <Scale size={23} />
          </div>

          <div>
            <h2 className="font-bold text-white">
              Legal CRM
            </h2>

            <p className="text-xs text-slate-400">
              Staff Portal
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {items.map(([name, href, Icon]) => {
            const active =
              href === "/staff"
                ? pathname === href
                : pathname === href ||
                  pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  flex items-center gap-3
                  rounded-lg px-3 py-2.5
                  text-sm
                  transition-all duration-150
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <Icon size={18} className="shrink-0" />

                <span className="truncate">
                  {name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Sign Out */}
      <div className="shrink-0 border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="
            flex w-full items-center gap-3
            rounded-lg px-3 py-2.5
            text-sm text-slate-300
            transition-all
            hover:bg-red-500/10
            hover:text-red-400
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <LogOut size={18} className="shrink-0" />

          <span>
            {loggingOut ? "Signing Out..." : "Sign Out"}
          </span>
        </button>
      </div>
    </aside>
  );
}