"use client";

import {
  CheckCircle2,
  Clock3,
  Edit3,
  LoaderCircle,
  Trash2,
  XCircle,
} from "lucide-react";

export type Task = {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | Date | null;
  status: string;
  assignedTo: string | null;
  createdAt: string | Date;
  isOverdue?: boolean;
};

type TaskTableProps = {
  tasks: Task[];
  loading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
};

function formatDate(date: string | Date | null) {
  if (!date) return "No due date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isOverdue(task: Task) {
  if (!task.dueDate) return false;

  if (
    task.status === "COMPLETED" ||
    task.status === "CANCELLED"
  ) {
    return false;
  }

  const dueDate = new Date(task.dueDate);

  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  return dueDate.getTime() < Date.now();
}

function getStatusClasses(status: string) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

    case "CANCELLED":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

    case "PENDING":
    default:
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "COMPLETED":
      return <CheckCircle2 className="h-3.5 w-3.5" />;

    case "IN_PROGRESS":
      return <LoaderCircle className="h-3.5 w-3.5" />;

    case "CANCELLED":
      return <XCircle className="h-3.5 w-3.5" />;

    case "PENDING":
    default:
      return <Clock3 className="h-3.5 w-3.5" />;
  }
}

function formatStatus(status: string) {
  switch (status) {
    case "IN_PROGRESS":
      return "In Progress";

    case "COMPLETED":
      return "Completed";

    case "CANCELLED":
      return "Cancelled";

    case "PENDING":
      return "Pending";

    default:
      return status
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }
}

export default function TaskTable({
  tasks,
  loading = false,
  onEdit,
  onDelete,
  onComplete,
}: TaskTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-h-[280px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <LoaderCircle className="h-5 w-5 animate-spin" />
            Loading tasks...
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
            <CheckCircle2 className="h-7 w-7 text-slate-500 dark:text-slate-400" />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            No tasks found
          </h3>

          <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Create a task to start managing your legal work and
            upcoming activities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50">
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Task
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Assigned To
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Due Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tasks.map((task) => {
                const overdue = isOverdue(task);

                return (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="max-w-[350px]">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {task.title}
                        </p>

                        {task.description ? (
                          <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {task.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs italic text-slate-400 dark:text-slate-500">
                            No description
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {task.assignedTo ? (
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {task.assignedTo}
                        </span>
                      ) : (
                        <span className="text-sm italic text-slate-400 dark:text-slate-500">
                          Unassigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p
                          className={`text-sm ${
                            overdue
                              ? "font-semibold text-red-600 dark:text-red-400"
                              : "text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {formatDate(task.dueDate)}
                        </p>

                        {overdue && (
                          <p className="mt-0.5 text-xs font-medium text-red-500 dark:text-red-400">
                            Overdue
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                          task.status
                        )}`}
                      >
                        {getStatusIcon(task.status)}
                        {formatStatus(task.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {task.status !== "COMPLETED" &&
                          task.status !== "CANCELLED" && (
                            <button
                              type="button"
                              onClick={() => onComplete(task)}
                              title="Mark complete"
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}

                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          title="Edit task"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(task)}
                          title="Delete task"
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {tasks.map((task) => {
          const overdue = isOverdue(task);

          return (
            <div
              key={task.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {task.description}
                    </p>
                  )}
                </div>

                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${getStatusClasses(
                    task.status
                  )}`}
                >
                  {getStatusIcon(task.status)}
                  {formatStatus(task.status)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Assigned To
                  </p>

                  <p className="mt-1 truncate text-sm text-slate-700 dark:text-slate-300">
                    {task.assignedTo || "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Due Date
                  </p>

                  <p
                    className={`mt-1 text-sm ${
                      overdue
                        ? "font-semibold text-red-600 dark:text-red-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {formatDate(task.dueDate)}
                  </p>
                </div>
              </div>

              {overdue && (
                <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/30 dark:text-red-400">
                  This task is overdue.
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                {task.status !== "COMPLETED" &&
                  task.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => onComplete(task)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Complete
                    </button>
                  )}

                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}