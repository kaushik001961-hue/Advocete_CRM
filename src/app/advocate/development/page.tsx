import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  Database,
  BriefcaseBusiness,
  FileText,
  History,
  CalendarDays,
  Link2,
  FolderOpen,
  Gavel,
  ListTodo,
  Users,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    step: 1,
    title: "Database & Foundation",
    description:
      "Core database models, Prisma configuration, authentication and application foundation.",
    status: "completed",
    icon: Database,
    pages: [
      { name: "Database / Prisma", href: "#" },
      { name: "Authentication", href: "#" },
    ],
  },
  {
    step: 2,
    title: "Cases API",
    description:
      "Create and retrieve cases through the ACMS Cases API.",
    status: "completed",
    icon: BriefcaseBusiness,
    pages: [
      { name: "Cases API", href: "#" },
    ],
  },
  {
    step: 3,
    title: "Case API by ID",
    description:
      "View and update individual case records.",
    status: "completed",
    icon: FileText,
    pages: [
      { name: "Case API", href: "#" },
    ],
  },
  {
    step: 4,
    title: "Cases Management UI",
    description:
      "Cases listing and Add Case interface for advocates.",
    status: "completed",
    icon: BriefcaseBusiness,
    pages: [
      { name: "Cases", href: "/advocate/cases" },
      { name: "Add Case", href: "/advocate/cases/new" },
    ],
  },
  {
    step: 5,
    title: "Case Detail",
    description:
      "Detailed case information, client, advocate and case metadata.",
    status: "completed",
    icon: FileText,
    pages: [
      { name: "Cases", href: "/advocate/cases" },
    ],
  },
  {
    step: 6,
    title: "Case Timeline",
    description:
      "Chronological case activity and important case events.",
    status: "completed",
    icon: History,
    pages: [
      { name: "Case Timeline", href: "#" },
    ],
  },
  {
    step: 7,
    title: "Important Dates & Notes",
    description:
      "Manage important dates, case notes and supporting case information.",
    status: "completed",
    icon: CalendarDays,
    pages: [
      { name: "Case Details", href: "/advocate/cases" },
    ],
  },
  {
    step: 8,
    title: "Related Cases",
    description:
      "Connect and manage relationships between related legal cases.",
    status: "completed",
    icon: Link2,
    pages: [
      { name: "Related Cases", href: "#" },
    ],
  },
  {
    step: 9,
    title: "Documents & Evidence",
    description:
      "Case documents, client documents and evidence management.",
    status: "completed",
    icon: FolderOpen,
    pages: [
      { name: "Documents", href: "#" },
    ],
  },
  {
    step: 10,
    title: "Hearings & Court Proceedings",
    description:
      "Manage hearings, court dates and proceedings for cases.",
    status: "completed",
    icon: Gavel,
    pages: [
      { name: "Hearings", href: "#" },
    ],
  },
  {
    step: 11,
    title: "Tasks & Work Management",
    description:
      "Assign and track advocate tasks and work deadlines.",
    status: "completed",
    icon: ListTodo,
    pages: [
      { name: "Tasks", href: "/advocate/tasks" },
    ],
  },
  {
    step: 12,
    title: "Calendar & Court Diary",
    description:
      "Calendar view for hearings, court dates and advocate activities.",
    status: "completed",
    icon: CalendarDays,
    pages: [
      { name: "Calendar", href: "/advocate/calendar" },
    ],
  },
  {
    step: 13,
    title: "Client Management & Client Portal",
    description:
      "Client management, client profiles and secure client portal foundation.",
    status: "in-progress",
    icon: Users,
    pages: [
      { name: "Clients", href: "/advocate/clients" },
      { name: "Client Portal", href: "#" },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
        <CheckCircle2 size={14} />
        Completed
      </span>
    );
  }

  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <Clock3 size={14} />
        In Progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
      <Circle size={14} />
      Planned
    </span>
  );
}

export default function DevelopmentPage() {
  const completed = steps.filter(
    (step) => step.status === "completed"
  ).length;

  const inProgress = steps.filter(
    (step) => step.status === "in-progress"
  ).length;

  const planned = steps.filter(
    (step) => step.status === "planned"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-600">
            <ShieldCheck size={18} />
            ACMS Development
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                ACMS Development Roadmap
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                View all major modules developed from Step 1 through Step 13
                and open the available ACMS interfaces directly.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500">
                Overall Progress
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {completed} / {steps.length}
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Completed"
            value={completed}
            description="Modules completed"
            icon={<CheckCircle2 size={21} />}
          />

          <SummaryCard
            title="In Progress"
            value={inProgress}
            description="Currently being developed"
            icon={<Clock3 size={21} />}
          />

          <SummaryCard
            title="Planned"
            value={planned}
            description="Upcoming modules"
            icon={<Circle size={21} />}
          />
        </div>

        {/* Progress */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Development Progress
              </h2>
              <p className="text-sm text-slate-500">
                Steps 1–13
              </p>
            </div>

            <span className="text-sm font-semibold text-blue-600">
              {Math.round((completed / steps.length) * 100)}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width: `${(completed / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-5">
          {steps.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.step}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  {/* Left */}
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                      <Icon size={24} />
                    </div>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          Step {item.step}
                        </span>

                        <StatusBadge status={item.status} />
                      </div>

                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h2>

                      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Pages */}
                  <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                    {item.pages.map((page) => {
                      const disabled = page.href === "#";

                      if (disabled) {
                        return (
                          <span
                            key={page.name}
                            className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500"
                          >
                            {page.name}
                          </span>
                        );
                      }

                      return (
                        <Link
                          key={page.name}
                          href={page.href}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          {page.name}
                          <ArrowRight size={15} />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-600" size={22} />

            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                ACMS Development Status
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-800/80 dark:text-blue-300/70">
                Steps 1–12 are currently represented as completed in the
                development roadmap. Step 13 covers Client Management and the
                Client Portal, with Client Management already available and
                the portal continuing as the next part of the module.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-slate-500">
          {title}
        </div>

        <div className="text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>

      <div className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">
        {description}
      </div>
    </div>
  );
}