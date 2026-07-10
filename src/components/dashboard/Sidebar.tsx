
"use client";

import Link from "next/link";

const menus = [
  {
    title: "Dashboard",
    href: "/admin",
  },
  {
    title: "Clients",
    href: "/admin/clients",
  },
  {
    title: "Cases",
    href: "/admin/cases",
  },
  {
    title: "Hearings",
    href: "/admin/hearings",
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
  },
  {
    title: "Documents",
    href: "/admin/documents",
  },
  {
    title: "Billing",
    href: "/admin/billing",
  },
  {
    title: "Reports",
    href: "/admin/reports",
  },
  {
    title: "Users",
    href: "/admin/users",
  },
  {
    title: "Settings",
    href: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-10">
        Advocate CRM
      </h1>

      <nav className="space-y-2">

        {menus.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            {item.title === "Dashboard" && "🏠"}
            {item.title === "Clients" && "👤"}
            {item.title === "Cases" && "⚖️"}
            {item.title === "Hearings" && "🔔"}
            {item.title === "Calendar" && "📅"}
            {item.title === "Documents" && "📄"}
            {item.title === "Billing" && "💳"}
            {item.title === "Reports" && "📊"}
            {item.title === "Users" && "👥"}
            {item.title === "Settings" && "⚙️"}

            <span>{item.title}</span>
          </Link>
        ))}

      </nav>

    </aside>
  );
}
