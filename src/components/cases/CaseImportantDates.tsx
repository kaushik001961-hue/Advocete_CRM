"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type ImportantDate = {
  id: string;
  caseId: string;
  title: string;
  date: string | Date;
  description?: string | null;
  createdAt?: string | Date;
};

type CaseImportantDatesProps = {
  caseId: string;
};

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateStatus(value: string | Date) {
  const date = new Date(value);
  const now = new Date();

  if (Number.isNaN(date.getTime())) {
    return "unknown";
  }

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const target = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (target.getTime() < today.getTime()) {
    return "past";
  }

  if (target.getTime() === today.getTime()) {
    return "today";
  }

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  if (target.getTime() <= sevenDaysFromNow.getTime()) {
    return "soon";
  }

  return "upcoming";
}

function getStatusClasses(status: string) {
  if (status === "today") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (status === "soon") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === "past") {
    return "border-gray-200 bg-gray-100 text-gray-500";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function getStatusLabel(status: string) {
  if (status === "today") return "Today";
  if (status === "soon") return "Upcoming";
  if (status === "past") return "Past";
  return "Scheduled";
}

export default function CaseImportantDates({
  caseId,
}: CaseImportantDatesProps) {
  const [importantDates, setImportantDates] = useState<
    ImportantDate[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadImportantDates = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/important-dates`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load important dates."
          );
        }

        if (!cancelled) {
          setImportantDates(data.importantDates ?? []);
        }
      } catch (err) {
        console.error("Important dates load error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load important dates."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadImportantDates();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  function resetForm() {
    setTitle("");
    setDate("");
    setDescription("");
    setError("");
    setSuccess("");
  }

  function openModal() {
    resetForm();

    const now = new Date();

    const localDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setDate(localDateTime);
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    resetForm();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a date title.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/cases/${caseId}/important-dates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            date,
            description: description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to create important date."
        );
      }

      setImportantDates((current) =>
        [...current, data.importantDate].sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        )
      );

      setSuccess("Important date added successfully.");

      window.setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 500);
    } catch (err) {
      console.error("Important date create error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create important date."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(dateId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this important date?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(dateId);
      setError("");

      const response = await fetch(
        `/api/cases/${caseId}/important-dates?dateId=${encodeURIComponent(
          dateId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete important date."
        );
      }

      setImportantDates((current) =>
        current.filter((item) => item.id !== dateId)
      );
    } catch (err) {
      console.error("Important date delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete important date."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar
              size={18}
              className="text-amber-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Important Dates
              </h2>

              <p className="text-[11px] text-gray-400">
                Important deadlines and dates for this case
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="flex w-fit items-center gap-2 rounded-lg bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            <Plus size={14} />
            Add Important Date
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2
                size={16}
                className="animate-spin"
              />
              Loading important dates...
            </div>
          </div>
        ) : importantDates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <Calendar size={18} />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No important dates
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Add deadlines, filing dates, client meetings,
              or other important dates.
            </p>

            <button
              type="button"
              onClick={openModal}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
            >
              Add First Date
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {importantDates.map((item) => {
              const status = getDateStatus(item.date);

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 text-amber-600">
                        <Calendar size={17} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs font-bold text-gray-900">
                            {item.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusClasses(
                              status
                            )}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </div>

                        <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
                          <Calendar size={11} />

                          {formatDate(item.date)}

                          <span>•</span>

                          <Clock size={11} />

                          {formatDateTime(item.date)}
                        </p>

                        {item.description && (
                          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id}
                      className="self-start rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete date"
                    >
                      {deletingId === item.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Add Important Date
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  Record an important deadline or event
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{success}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="important-date-title"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Date Title
                </label>

                <input
                  id="important-date-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Evidence submission deadline"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="important-date-value"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Date &amp; Time
                </label>

                <input
                  id="important-date-value"
                  type="datetime-local"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="important-date-description"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="important-date-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Add details about this date..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  disabled={saving}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {saving ? "Saving..." : "Add Date"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}