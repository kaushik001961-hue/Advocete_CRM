"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

import type { Task } from "./TaskTable";

type Advocate = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ADVOCATE" | "STAFF";
};

type TaskFormProps = {
  task?: Task | null;
  onSuccess: (task: Task) => void;
  onCancel: () => void;
};

const STATUSES = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

function getDateInputValue(
  date: string | Date | null | undefined
) {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function TaskForm({
  task,
  onSuccess,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(
    () => task?.title ?? ""
  );

  const [description, setDescription] = useState(
    () => task?.description ?? ""
  );

  const [dueDate, setDueDate] = useState(() =>
    getDateInputValue(task?.dueDate)
  );

  const [assignedTo, setAssignedTo] = useState(
    () => task?.assignedTo ?? ""
  );

  const [status, setStatus] = useState(
    () => task?.status ?? "PENDING"
  );

  const [advocates, setAdvocates] = useState<Advocate[]>(
    []
  );

  const [loadingAdvocates, setLoadingAdvocates] =
    useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(task);

  /*
   * Load advocates/staff.
   *
   * State is updated inside the async fetch callback,
   * rather than synchronously inside the effect.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadAdvocates() {
      try {
        setLoadingAdvocates(true);

        const response = await fetch("/api/advocates", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load advocates."
          );
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.advocates)
            ? data.advocates
            : [];

        setAdvocates(list);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Load advocates error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load advocates."
        );
      } finally {
        if (!cancelled) {
          setLoadingAdvocates(false);
        }
      }
    }

    void loadAdvocates();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: title.trim(),
        description: description.trim() || null,

        dueDate: dueDate
          ? new Date(
              `${dueDate}T00:00:00`
            ).toISOString()
          : null,

        /*
         * Store the selected User ID in the existing
         * Task.assignedTo text column.
         */
        assignedTo: assignedTo || null,

        status,
      };

      const response = await fetch(
        isEditing
          ? `/api/tasks/${task?.id}`
          : "/api/tasks",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to save task."
        );
      }

      onSuccess(data);
    } catch (err) {
      console.error("Task form error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the task."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Task Title */}
      <div>
        <label
          htmlFor="task-title"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Task Title{" "}
          <span className="text-red-500">*</span>
        </label>

        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          placeholder="e.g. Prepare documents for hearing"
          disabled={saving}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="task-description"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Description
        </label>

        <textarea
          id="task-description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          placeholder="Add details about this task..."
          rows={4}
          disabled={saving}
          className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
        />
      </div>

      {/* Due Date + Assigned To */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Due Date */}
        <div>
          <label
            htmlFor="task-due-date"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Due Date
          </label>

          <input
            id="task-due-date"
            type="date"
            value={dueDate}
            onChange={(event) =>
              setDueDate(event.target.value)
            }
            disabled={saving}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
          />
        </div>

        {/* Assigned To */}
        <div>
          <label
            htmlFor="task-assigned-to"
            className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Assigned To
          </label>

          <select
            id="task-assigned-to"
            value={assignedTo}
            onChange={(event) =>
              setAssignedTo(event.target.value)
            }
            disabled={
              saving || loadingAdvocates
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
          >
            <option value="">
              {loadingAdvocates
                ? "Loading advocates..."
                : "Select advocate or staff"}
            </option>

            {!loadingAdvocates &&
              advocates.length === 0 && (
                <option value="" disabled>
                  No advocates or staff found
                </option>
              )}

            {advocates.map((advocate) => (
              <option
                key={advocate.id}
                value={advocate.id}
              >
                {advocate.name} —{" "}
                {advocate.role === "STAFF"
                  ? "Staff"
                  : "Advocate"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="task-status"
          className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Status
        </label>

        <select
          id="task-status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
          disabled={saving}
          className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
        >
          {STATUSES.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {saving ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {isEditing
                ? "Updating..."
                : "Creating..."}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isEditing
                ? "Update Task"
                : "Create Task"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}