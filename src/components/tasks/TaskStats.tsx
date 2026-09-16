"use client";

import {
  CheckCircle2,
  Clock3,
  ListTodo,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

type TaskStatsProps = {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
};

export default function TaskStats({
  total,
  pending,
  inProgress,
  completed,
  overdue,
}: TaskStatsProps) {
  const stats = [
    {
      label: "Total Tasks",
      value: total,
      icon: ListTodo,
      description: "All tasks",
    },
    {
      label: "Pending",
      value: pending,
      icon: Clock3,
      description: "Waiting to start",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: LoaderCircle,
      description: "Currently active",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      description: "Finished tasks",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      description: "Past due date",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {stat.description}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-2.5 dark:bg-slate-800">
                <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}