import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  CalendarDays,
  Users,
  BriefcaseBusiness,
  FileText,
  ListTodo,
  ArrowUpRight,
} from "lucide-react";

export default async function StaffDashboard() {
  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [hearings, clients, documents, cases, tasks] = await Promise.all([
    prisma.hearing.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    }),

    prisma.client.count(),

    prisma.document.count(),

    prisma.case.count(),

    prisma.task.count({
      where: {
        OR: [
          { assignedTo: null },
          { assignedTo: "" },
        ],
      },
    }),
  ]);

  const cards = [
    {
      title: "Today's Hearings",
      value: hearings,
      href: "/staff/hearings",
      icon: CalendarDays,
      description: "Hearings scheduled today",
    },
    {
      title: "Clients",
      value: clients,
      href: "/staff/clients",
      icon: Users,
      description: "Manage client records",
    },
    {
      title: "Cases",
      value: cases,
      href: "/staff/cases",
      icon: BriefcaseBusiness,
      description: "View and manage cases",
    },
    {
      title: "Documents",
      value: documents,
      href: "/staff/documents",
      icon: FileText,
      description: "Manage case documents",
    },
    {
      title: "Unassigned Tasks",
      value: tasks,
      href: "/staff/tasks",
      icon: ListTodo,
      description: "Tasks waiting for assignment",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Staff Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Operational overview for today.
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-gray-200">
                  <Icon className="h-5 w-5 text-gray-700" />
                </div>

                <ArrowUpRight className="h-5 w-5 text-gray-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-700" />
              </div>

              <p className="mt-4 text-sm font-medium text-gray-500">
                {card.title}
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {card.value}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}