"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  FileText,
  Receipt,
  User,
  LogOut,
  Menu,
  X,
  Scale,
  Users,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Clock3,
  FileCheck2,
  Wallet,
  BarChart3,
} from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export default function AdvocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Case Management": true,
    "Court Work": true,
    Documents: true,
    Finance: true,
    Reports: true,
  });

  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/advocate",
          icon: LayoutDashboard,
        },
      ],
    },

    {
      title: "Case Management",
      items: [
        {
          name: "My Cases",
          href: "/advocate/cases",
          icon: Briefcase,
        },
        {
          name: "Clients",
          href: "/advocate/clients",
          icon: Users,
        },
        {
          name: "Case Timeline",
          href: "/advocate/cases",
          icon: Clock3,
        },
        {
          name: "Important Dates",
          href: "/advocate/cases",
          icon: Calendar,
        },
        {
          name: "Case Notes",
          href: "/advocate/cases",
          icon: FileText,
        },
        {
          name: "Related Cases",
          href: "/advocate/cases",
          icon: FileCheck2,
        },
      ],
    },

    {
      title: "Court Work",
      items: [
        {
          name: "Hearings",
          href: "/advocate/hearings",
          icon: Calendar,
        },
        {
          name: "Court Calendar",
          href: "/advocate/calendar",
          icon: Calendar,
        },
        {
          name: "Tasks",
          href: "/advocate/tasks",
          icon: ClipboardList,
        },
      ],
    },

    {
      title: "Documents",
      items: [
        {
          name: "Documents",
          href: "/advocate/documents",
          icon: FileText,
        },
        {
          name: "Evidence",
          href: "/advocate/documents",
          icon: FileCheck2,
        },
      ],
    },

    {
      title: "Finance",
      items: [
        {
          name: "Billing & Invoices",
          href: "/advocate/billing",
          icon: Receipt,
        },
        {
          name: "Invoices",
          href: "/advocate/invoices",
          icon: FileText,
        },
      ],
    },

    {
      title: "Reports",
      items: [
        {
          name: "Reports & Analytics",
          href: "/advocate/reports",
          icon: BarChart3,
        },
      ],
    },

    {
      title: "Account",
      items: [
        {
          name: "Profile",
          href: "/advocate/profile",
          icon: User,
        },
      ],
    },
  ];

  function toggleSection(title: string) {
    setOpenSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }

  function isItemActive(href: string) {
    if (href === "/advocate") {
      return pathname === "/advocate";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ================================
          MOBILE TOP BAR
      ================================= */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
            <Scale size={20} />
          </div>

          <div>
            <p className="font-bold text-sm">Legal CRM</p>
            <p className="text-[10px] text-slate-400">Advocate Portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {/* ================================
          MOBILE BACKDROP
      ================================= */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ================================
          SIDEBAR
      ================================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-[86px] px-5 flex items-center gap-3 border-b border-slate-800 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Scale size={23} />
          </div>

          <div>
            <h2 className="font-bold text-white text-base">
              Legal CRM
            </h2>
            <p className="text-xs text-slate-400">
              Advocate Portal
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-700">
          <nav className="space-y-4">
            {sections.map((section) => {
              const isOverview = section.title === "Overview";
              const isAccount = section.title === "Account";

              return (
                <div key={section.title}>
                  {/* Section Header */}
                  {!isOverview && (
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      className="w-full flex items-center justify-between px-3 mb-2 group"
                    >
                      <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 group-hover:text-slate-300 transition">
                        {section.title}
                      </span>

                      {openSections[section.title] ? (
                        <ChevronDown
                          size={14}
                          className="text-slate-500"
                        />
                      ) : (
                        <ChevronRight
                          size={14}
                          className="text-slate-500"
                        />
                      )}
                    </button>
                  )}

                  {/* Items */}
                  {(isOverview ||
                    isAccount ||
                    openSections[section.title]) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item.href);

                        return (
                          <Link
                            key={`${section.title}-${item.name}`}
                            href={item.href}
                            onClick={() =>
                              setIsSidebarOpen(false)
                            }
                            className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                            ${
                              active
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            <Icon
                              size={17}
                              className={
                                active
                                  ? "text-white"
                                  : "text-slate-500 group-hover:text-blue-400"
                              }
                            />

                            <span className="truncate">
                              {item.name}
                            </span>

                            {active && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* ================================
            USER FOOTER
        ================================= */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          {/* User */}
          <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-800/60 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
              AD
            </div>

            <div className="overflow-hidden min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                Adv. Rahul Sharma
              </p>

              <p className="text-[10px] text-slate-400 truncate">
                advocate1@crm.com
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ================================
          MAIN CONTENT
      ================================= */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}