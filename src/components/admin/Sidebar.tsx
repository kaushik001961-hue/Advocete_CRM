"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileText,
  Receipt,
  Wallet,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    name: "Cases",
    href: "/admin/cases",
    icon: Briefcase,
  },
  {
    name: "Hearings",
    href: "/admin/hearings",
    icon: Calendar,
  },
  {
    name: "Documents",
    href: "/admin/documents",
    icon: FileText,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: Receipt,
  },
  {
    name: "Expenses",
    href: "/admin/expenses",
    icon: Wallet,
  },
  {
    name: "Tasks",
    href: "/admin/tasks",
    icon: CheckSquare,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold">Advocate CRM</h1>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition"
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}