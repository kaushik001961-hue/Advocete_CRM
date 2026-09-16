"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  FolderOpen,
  Receipt,
  Wallet,
  CreditCard,
  UserCog,
  ShieldCheck,
  BarChart3,
  Bell,
  Settings,
  ScrollText,
  Scale,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [openSections, setOpenSections] = useState<
    Record<string, boolean>
  >({
    "Case Management": true,
    "Court Management": true,
    Documents: true,
    Finance: true,
    Team: true,
    Reports: true,
    System: true,
  });

  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ],
    },

    {
  title: "Case Management",
  items: [
    {
      name: "All Cases",
      href: "/admin/cases",
      icon: Briefcase,
    },
    {
      name: "Clients",
      href: "/admin/clients",
      icon: Users,
    },
    {
      name: "eCourts Integration",
      href: "/admin/ecourts",
      icon: Scale,
    },
  ],
},

    {
      title: "Court Management",
      items: [
        {
          name: "Hearings",
          href: "/admin/hearings",
          icon: CalendarDays,
        },
        {
          name: "Court Calendar",
          href: "/admin/calendar",
          icon: CalendarDays,
        },
        {
          name: "Tasks",
          href: "/admin/tasks",
          icon: ClipboardList,
        },
      ],
    },

    {
      title: "Documents",
      items: [
        {
          name: "Documents",
          href: "/admin/documents",
          icon: FileText,
        },
              ],
    },

    {
      title: "Finance",
      items: [
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
          name: "Payments",
          href: "/admin/payments",
          icon: CreditCard,
        },
      ],
    },

    {
      title: "Team",
      items: [
        {
          name: "Advocates",
          href: "/admin/advocates",
          icon: Scale,
        },
        {
          name: "Staff",
          href: "/admin/staff",
          icon: UserCog,
        },
        {
          name: "User Management",
          href: "/admin/users",
          icon: ShieldCheck,
        },
      ],
    },

    {
      title: "Reports",
      items: [
        {
          name: "Reports & Analytics",
          href: "/admin/reports",
          icon: BarChart3,
        },
        {
          name: "Audit Logs",
          href: "/admin/audit-logs",
          icon: ScrollText,
        },
      ],
    },

    {
      title: "System",
      items: [
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
      ],
    },
  ];

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function toggleSection(title: string) {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  async function handleLogout() {
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <aside
      className={`
        fixed
        top-0
        bottom-0
        left-0
        z-50
        w-64
        bg-slate-950
        text-slate-300
        flex
        flex-col
        border-r
        border-slate-800
        transition-transform
        duration-300
        ease-in-out
        lg:translate-x-0
        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      {/* Header */}
      <div className="h-[86px] px-5 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Scale size={23} />
          </div>

          <div>
            <h2 className="font-bold text-white text-base">
              Legal CRM
            </h2>

            <p className="text-xs text-slate-500">
              Admin Portal
            </p>
          </div>
        </div>

        {/* Mobile Close */}
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="space-y-5">
          {sections.map((section) => {
            const isOverview =
              section.title === "Overview";

            return (
              <div key={section.title}>
                {!isOverview && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleSection(section.title)
                    }
                    className="w-full flex items-center justify-between px-3 mb-2"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      {section.title}
                    </span>

                    {openSections[section.title] ? (
                      <ChevronDown
                        size={14}
                        className="text-slate-600"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        className="text-slate-600"
                      />
                    )}
                  </button>
                )}

                {(isOverview ||
                  openSections[section.title]) && (
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={`${section.title}-${item.name}`}
                          href={item.href}
                          onClick={onClose}
                          className={`
                            group
                            flex
                            items-center
                            gap-3
                            px-3.5
                            py-2.5
                            rounded-xl
                            text-sm
                            font-medium
                            transition-all
                            duration-200
                            ${
                              active
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                            }
                          `}
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

      {/* Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-slate-900 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            AD
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              Administrator
            </p>

            <p className="text-[10px] text-slate-500 truncate">
              Legal CRM Admin
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 hover:text-red-300 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
