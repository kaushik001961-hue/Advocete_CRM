"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Gavel,
  Loader2,
  Plus,
  Scale,
  Trash2,
  X,
} from "lucide-react";

type TimelineEvent = {
  id: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate: string | Date;
  createdAt?: string | Date | null;
};

type CaseTimelineProps = {
  caseId: string;
};

const EVENT_TYPES = [
  {
    value: "FILING",
    label: "Filing",
  },
  {
    value: "HEARING",
    label: "Hearing",
  },
  {
    value: "DOCUMENT_ADDED",
    label: "Document Added",
  },
  {
    value: "IMPORTANT_DATE",
    label: "Important Date",
  },
  {
    value: "NOTE_ADDED",
    label: "Note Added",
  },
  {
    value: "STATUS_CHANGED",
    label: "Status Changed",
  },
  {
    value: "ORDER_PASSED",
    label: "Order Passed",
  },
  {
    value: "ARGUMENT",
    label: "Argument",
  },
  {
    value: "JUDGMENT",
    label: "Judgment",
  },
  {
    value: "CASE_CLOSED",
    label: "Case Closed",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

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

function getEventLabel(eventType: string) {
  const normalized = eventType.toUpperCase();

  if (normalized === "CASE_CREATED") {
    return "Case Created";
  }

  if (normalized === "CASE_UPDATED") {
    return "Case Updated";
  }

  const event = EVENT_TYPES.find(
    (item) => item.value === normalized
  );

  if (event) {
    return event.label;
  }

  return eventType.replaceAll("_", " ");
}

function getEventIcon(eventType: string) {
  const normalized = eventType.toUpperCase();

  if (normalized === "CASE_CREATED") {
    return <CheckCircle2 size={15} />;
  }

  if (normalized === "CASE_UPDATED") {
    return <Activity size={15} />;
  }

  if (normalized === "HEARING") {
    return <Calendar size={15} />;
  }

  if (normalized === "FILING") {
    return <FileText size={15} />;
  }

  if (normalized === "ORDER_PASSED") {
    return <Gavel size={15} />;
  }

  if (normalized === "JUDGMENT") {
    return <Scale size={15} />;
  }

  if (normalized === "CASE_CLOSED") {
    return <CheckCircle2 size={15} />;
  }

  return <Activity size={15} />;
}

function getEventIconClasses(eventType: string) {
  const normalized = eventType.toUpperCase();

  if (normalized === "CASE_CREATED") {
    return "bg-emerald-50 text-emerald-600 border-emerald-200";
  }

  if (normalized === "CASE_UPDATED") {
    return "bg-blue-50 text-blue-600 border-blue-200";
  }

  if (normalized === "HEARING") {
    return "bg-purple-50 text-purple-600 border-purple-200";
  }

  if (normalized === "FILING") {
    return "bg-indigo-50 text-indigo-600 border-indigo-200";
  }

  if (normalized === "ORDER_PASSED") {
    return "bg-amber-50 text-amber-600 border-amber-200";
  }

  if (normalized === "JUDGMENT") {
    return "bg-orange-50 text-orange-600 border-orange-200";
  }

  if (normalized === "CASE_CLOSED") {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }

  return "bg-gray-50 text-gray-600 border-gray-200";
}

export default function CaseTimeline({
  caseId,
}: CaseTimelineProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("OTHER");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchTimeline = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/timeline`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load timeline."
          );
        }

        if (!cancelled) {
          setEvents(data.events ?? []);
        }
      } catch (err) {
        console.error(
          "Timeline load error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load timeline."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchTimeline();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  function resetForm() {
    setTitle("");
    setEventType("OTHER");
    setEventDate("");
    setDescription("");
    setError("");
    setSuccess("");
  }

  function openModal() {
    resetForm();

    const now = new Date();

    const localDateTime = new Date(
      now.getTime() -
        now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16);

    setEventDate(localDateTime);
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
      setError("Please enter an event title.");
      return;
    }

    if (!eventDate) {
      setError("Please select an event date.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/cases/${caseId}/timeline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            eventType,
            eventDate,
            description:
              description.trim() || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to create timeline event."
        );
      }

      setEvents((current) =>
        [data.event, ...current].sort(
          (a, b) =>
            new Date(b.eventDate).getTime() -
            new Date(a.eventDate).getTime()
        )
      );

      setSuccess(
        "Timeline event added successfully."
      );

      window.setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 500);
    } catch (err) {
      console.error(
        "Timeline create error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create timeline event."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(eventId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this timeline event?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(eventId);
      setError("");

      const response = await fetch(
        `/api/cases/${caseId}/timeline?eventId=${encodeURIComponent(
          eventId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete timeline event."
        );
      }

      setEvents((current) =>
        current.filter(
          (item) => item.id !== eventId
        )
      );
    } catch (err) {
      console.error(
        "Timeline delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete timeline event."
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
            <Clock
              size={18}
              className="text-purple-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Case Timeline
              </h2>

              <p className="text-[11px] text-gray-400">
                Complete chronological history of this
                case
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="flex w-fit items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
          >
            <Plus size={14} />
            Add Timeline Event
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

              Loading timeline...
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-purple-50 text-purple-500">
              <Activity size={18} />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No timeline events
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Start building the case history by adding
              the first event.
            </p>

            <button
              type="button"
              onClick={openModal}
              className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-purple-700"
            >
              Add First Event
            </button>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-gray-200" />

            <div className="space-y-5">
              {events.map((item) => (
                <div
                  key={item.id}
                  className="relative flex gap-4"
                >
                  <div
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${getEventIconClasses(
                      item.eventType
                    )}`}
                  >
                    {getEventIcon(
                      item.eventType
                    )}
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xs font-bold text-gray-900">
                            {item.title}
                          </h3>

                          <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                            {getEventLabel(
                              item.eventType
                            )}
                          </span>
                        </div>

                        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                          <Calendar size={11} />

                          {formatDate(
                            item.eventDate
                          )}

                          <span>•</span>

                          {formatDateTime(
                            item.eventDate
                          )}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        disabled={
                          deletingId === item.id
                        }
                        className="self-start rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete event"
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

                    {item.description && (
                      <p className="mt-3 whitespace-pre-wrap text-xs leading-5 text-gray-600">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Add Timeline Event
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  Record an important event in this case
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
                  htmlFor="timeline-title"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Event Title
                </label>

                <input
                  id="timeline-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Written statement filed"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="timeline-type"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Event Type
                </label>

                <select
                  id="timeline-type"
                  value={eventType}
                  onChange={(event) =>
                    setEventType(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  disabled={saving}
                >
                  {EVENT_TYPES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="timeline-date"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Event Date &amp; Time
                </label>

                <input
                  id="timeline-date"
                  type="datetime-local"
                  value={eventDate}
                  onChange={(event) =>
                    setEventDate(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="timeline-description"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Description
                </label>

                <textarea
                  id="timeline-description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Add details about this event..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
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
                  className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}