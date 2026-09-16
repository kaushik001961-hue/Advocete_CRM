"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ListTodo,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";

import TaskForm from "@/components/tasks/TaskForm";
import TaskStats from "@/components/tasks/TaskStats";
import TaskTable, {
  type Task,
} from "@/components/tasks/TaskTable";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(
    null
  );

  const loadTasks = useCallback(
    async (showRefresh = false) => {
      try {
        setError("");

        if (showRefresh) {
          setRefreshing(true);
        }

        const response = await fetch("/api/tasks", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load tasks."
          );
        }

        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Load tasks error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load tasks."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const response = await fetch("/api/tasks", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load tasks."
          );
        }

        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Initial task load error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load tasks."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const pending = tasks.filter(
    (task) => task.status === "PENDING"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "IN_PROGRESS"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "COMPLETED"
  ).length;

  /*
   * The API marks overdue tasks server-side.
   * This avoids calling Date.now() during React render.
   */
  const overdue = tasks.filter(
    (task) => task.isOverdue === true
  ).length;

  function handleCreate() {
    setEditingTask(null);
    setShowForm(true);
  }

  function handleEdit(task: Task) {
    setEditingTask(task);
    setShowForm(true);
  }

  function handleFormSuccess(savedTask: Task) {
    setTasks((currentTasks) => {
      const exists = currentTasks.some(
        (task) => task.id === savedTask.id
      );

      if (exists) {
        return currentTasks.map((task) =>
          task.id === savedTask.id ? savedTask : task
        );
      }

      return [savedTask, ...currentTasks];
    });

    setShowForm(false);
    setEditingTask(null);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingTask(null);
  }

  async function handleComplete(task: Task) {
    const confirmed = window.confirm(
      `Mark "${task.title}" as completed?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to complete task."
        );
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === task.id ? data : item
        )
      );
    } catch (err) {
      console.error("Complete task error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete task."
      );
    }
  }

  async function handleDelete(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to delete task."
        );
      }

      setTasks((currentTasks) =>
        currentTasks.filter((item) => item.id !== task.id)
      );
    } catch (err) {
      console.error("Delete task error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete task."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 dark:bg-white">
              <ListTodo className="h-5 w-5 text-white dark:text-slate-900" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Tasks
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your legal work and upcoming activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadTasks(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-950/50"
              aria-label="Close error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Statistics */}
        <TaskStats
          total={tasks.length}
          pending={pending}
          inProgress={inProgress}
          completed={completed}
          overdue={overdue}
        />

        {/* Task List */}
        <div className="mt-6">
          <TaskTable
            tasks={tasks}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onComplete={handleComplete}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={handleFormCancel}
            aria-hidden="true"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {editingTask
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {editingTask
                    ? "Update task details and status."
                    : "Add a new task to your work list."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleFormCancel}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              <TaskForm
                key={editingTask?.id ?? "new-task"}
                task={editingTask}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}