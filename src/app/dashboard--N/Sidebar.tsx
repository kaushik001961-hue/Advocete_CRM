"use client";

import Link from "next/link";

const menus = [

  {
    title: "Dashboard",
    href: "/dashboard",
  },

  {
    title: "Clients",
    href: "/dashboard/clients",
  },

  {
    title: "Cases",
    href: "/dashboard/cases",
  },

  {
    title: "Hearings",
    href: "/dashboard/hearings",
  },

  {
    title: "Documents",
    href: "/dashboard/documents",
  },

  {
    title: "Billing",
    href: "/dashboard/billing",
  },

  {
    title: "Reports",
    href: "/dashboard/reports",
  },

  {
    title: "Users",
    href: "/dashboard/users",
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
  },

];

export default function Sidebar() {

  return (

    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-10">

        Advocate CRM

      </h1>

      <div className="space-y-4">

        {menus.map((item) => (

          <Link

            key={item.title}

            href={item.href}

            className="block p-3 rounded-lg hover:bg-slate-700"

          >

            {item.title}

          </Link>

        ))}

      </div>

    </aside>

  );

}