"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  ListTodo,
  MapPin,
  RefreshCw,
  Scale,
  X,
} from "lucide-react";

type CalendarEvent = {
  id: string;
  date: string;
  type:
    | "HEARING"
    | "TASK"
    | "IMPORTANT_DATE";
  title: string;
  subtitle: string;
  description: string | null;
  status: string | null;
  caseId: string | null;
  caseNumber: string | null;
  caseTitle: string | null;
  court: string | null;
  courtRoom: string | null;
  hearingType: string | null;
};

type ViewMode = "MONTH" | "WEEK" | "DAY";

const WEEKDAYS = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

function startOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(
  first: Date,
  second: Date
) {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function startOfWeek(date: Date) {
  const value = startOfDay(date);
  value.setDate(
    value.getDate() - value.getDay()
  );
  return value;
}

function addDays(
  date: Date,
  amount: number
) {
  const value = new Date(date);
  value.setDate(
    value.getDate() + amount
  );
  return value;
}

function getMonthDays(date: Date) {
  const firstDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );

  const gridStart = startOfWeek(firstDay);

  return Array.from(
    { length: 42 },
    (_, index) =>
      addDays(gridStart, index)
  );
}

function formatMonth(date: Date) {
  return date.toLocaleDateString(
    "en-IN",
    {
      month: "long",
      year: "numeric",
    }
  );
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}

function formatTime(value: string) {
  const date = new Date(value);

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function eventClass(
  type: CalendarEvent["type"]
) {
  if (type === "HEARING") {
    return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300";
  }

  if (type === "TASK") {
    return "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300";
  }

  return "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300";
}

function eventDotClass(
  type: CalendarEvent["type"]
) {
  if (type === "HEARING") {
    return "bg-blue-500";
  }

  if (type === "TASK") {
    return "bg-purple-500";
  }

  return "bg-orange-500";
}

function eventIcon(
  type: CalendarEvent["type"]
) {
  if (type === "HEARING") {
    return (
      <Scale className="h-4 w-4" />
    );
  }

  if (type === "TASK") {
    return (
      <ListTodo className="h-4 w-4" />
    );
  }

  return (
    <CalendarDays className="h-4 w-4" />
  );
}

function statusLabel(
  status: string | null
) {
  if (!status) return "";

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

export default function AdvocateCalendarPage() {
  const [events, setEvents] =
    useState<CalendarEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [currentDate, setCurrentDate] =
    useState(() => new Date());

  const [selectedDate, setSelectedDate] =
    useState(() => new Date());

  const [view, setView] =
    useState<ViewMode>("MONTH");

  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEvent | null>(null);

  async function loadCalendar(
    refresh = false
  ) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      }

      const response = await fetch(
        "/api/calendar",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to load calendar."
        );
      }

      setEvents(
        Array.isArray(data?.events)
          ? data.events
          : []
      );
    } catch (err) {
      console.error(
        "Calendar load error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load calendar."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const response = await fetch(
          "/api/calendar",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load calendar."
          );
        }

        setEvents(
          Array.isArray(data?.events)
            ? data.events
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Initial calendar load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load calendar."
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

  const monthDays = useMemo(
    () => getMonthDays(currentDate),
    [currentDate]
  );

  const weekStart = useMemo(
    () => startOfWeek(selectedDate),
    [selectedDate]
  );

  const weekDays = useMemo(
    () =>
      Array.from(
        { length: 7 },
        (_, index) =>
          addDays(weekStart, index)
      ),
    [weekStart]
  );

  const dayEvents = useMemo(
    () =>
      events
        .filter((event) =>
          isSameDay(
            new Date(event.date),
            selectedDate
          )
        )
        .sort(
          (a, b) =>
            new Date(a.date).getTime() -
            new Date(b.date).getTime()
        ),
    [events, selectedDate]
  );

  const upcomingEvents = useMemo(() => {
    const today = startOfDay(
      new Date()
    );

    return events
      .filter(
        (event) =>
          new Date(event.date) >= today
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      )
      .slice(0, 8);
  }, [events]);

  const todayCount = useMemo(
    () =>
      events.filter((event) =>
        isSameDay(
          new Date(event.date),
          new Date()
        )
      ).length,
    [events]
  );

  function eventsForDate(date: Date) {
    return events
      .filter((event) =>
        isSameDay(
          new Date(event.date),
          date
        )
      )
      .sort(
        (a, b) =>
          new Date(a.date).getTime() -
          new Date(b.date).getTime()
      );
  }

  function goPrevious() {
    if (view === "MONTH") {
      setCurrentDate(
        (date) =>
          new Date(
            date.getFullYear(),
            date.getMonth() - 1,
            1
          )
      );
      return;
    }

    if (view === "WEEK") {
      setSelectedDate((date) =>
        addDays(date, -7)
      );
      return;
    }

    setSelectedDate((date) =>
      addDays(date, -1)
    );
  }

  function goNext() {
    if (view === "MONTH") {
      setCurrentDate(
        (date) =>
          new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            1
          )
      );
      return;
    }

    if (view === "WEEK") {
      setSelectedDate((date) =>
        addDays(date, 7)
      );
      return;
    }

    setSelectedDate((date) =>
      addDays(date, 1)
    );
  }

  function goToday() {
    const today = new Date();

    setCurrentDate(today);
    setSelectedDate(today);
  }

  function selectDate(date: Date) {
    setSelectedDate(date);

    if (
      date.getMonth() !==
        currentDate.getMonth() ||
      date.getFullYear() !==
        currentDate.getFullYear()
    ) {
      setCurrentDate(
        new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        )
      );
    }
  }

  function renderEvent(
    event: CalendarEvent,
    compact = false
  ) {
    return (
      <button
        key={event.id}
        type="button"
        onClick={() =>
          setSelectedEvent(event)
        }
        className={`w-full rounded-md border px-2 py-1 text-left text-[11px] font-medium transition hover:shadow-sm ${eventClass(
          event.type
        )}`}
      >
        <div className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${eventDotClass(
              event.type
            )}`}
          />

          <span className="truncate">
            {compact
              ? event.title
              : `${formatTime(
                  event.date
                )} · ${event.title}`}
          </span>
        </div>

        {!compact &&
          event.caseNumber && (
            <p className="mt-0.5 truncate pl-3 text-[9px] opacity-70">
              {event.caseNumber}
            </p>
          )}
      </button>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 dark:bg-white">
                <CalendarDays className="h-5 w-5 text-white dark:text-slate-900" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  Court Diary
                </h1>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Hearings, tasks and important case dates in one calendar.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToday}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() =>
                  loadCalendar(true)
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh
              </button>

              <Link
                href="/advocate/hearings"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                <Scale className="h-4 w-4" />
                Hearings
              </Link>

              <Link
                href="/advocate/tasks"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <ListTodo className="h-4 w-4" />
                Tasks
              </Link>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Legend */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">
              Today&apos;s Events
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {todayCount}
            </p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                Court Hearings
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-purple-200 bg-purple-50 p-3 dark:border-purple-900 dark:bg-purple-950/30">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                Tasks
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-900 dark:bg-orange-950/30">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-300">
                Important Dates
              </span>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Calendar toolbar */}
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goPrevious}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <h2 className="ml-2 text-lg font-bold text-slate-900 dark:text-white">
                  {view === "MONTH"
                    ? formatMonth(
                        currentDate
                      )
                    : view === "WEEK"
                      ? `${weekDays[0].toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                          }
                        )} – ${weekDays[6].toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}`
                      : formatLongDate(
                          selectedDate
                        )}
                </h2>
              </div>

              <div className="flex rounded-lg border border-slate-200 p-1 dark:border-slate-700">
                {(
                  [
                    ["MONTH", "Month"],
                    ["WEEK", "Week"],
                    ["DAY", "Day"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setView(value)
                    }
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      view === value
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center text-sm text-slate-400">
                Loading court diary...
              </div>
            ) : view === "MONTH" ? (
              <>
                {/* Weekday header */}
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                  {WEEKDAYS.map(
                    (day) => (
                      <div
                        key={day}
                        className="px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Month */}
                <div className="grid grid-cols-7">
                  {monthDays.map(
                    (date, index) => {
                      const dateEvents =
                        eventsForDate(
                          date
                        );

                      const outsideMonth =
                        date.getMonth() !==
                        currentDate.getMonth();

                      const today =
                        isSameDay(
                          date,
                          new Date()
                        );

                      return (
                        <div
                          key={`${date.toISOString()}-${index}`}
                          onClick={() =>
                            selectDate(
                              date
                            )
                          }
                          className={`min-h-[125px] cursor-pointer border-b border-r border-slate-100 p-1.5 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                            outsideMonth
                              ? "bg-slate-50/60 dark:bg-slate-950/40"
                              : ""
                          }`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                today
                                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                                  : outsideMonth
                                    ? "text-slate-300 dark:text-slate-700"
                                    : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {date.getDate()}
                            </span>

                            {dateEvents.length >
                              0 && (
                              <span className="text-[9px] text-slate-400">
                                {
                                  dateEvents.length
                                }
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            {dateEvents
                              .slice(0, 3)
                              .map(
                                (
                                  event
                                ) =>
                                  renderEvent(
                                    event,
                                    true
                                  )
                              )}

                            {dateEvents.length >
                              3 && (
                              <p className="px-1 text-[9px] font-semibold text-slate-400">
                                +
                                {dateEvents.length -
                                  3}{" "}
                                more
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            ) : view === "WEEK" ? (
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                    {weekDays.map(
                      (date) => (
                        <button
                          key={date.toISOString()}
                          type="button"
                          onClick={() =>
                            selectDate(
                              date
                            )
                          }
                          className={`border-r border-slate-200 px-3 py-4 text-center dark:border-slate-800 ${
                            isSameDay(
                              date,
                              new Date()
                            )
                              ? "bg-slate-50 dark:bg-slate-800"
                              : ""
                          }`}
                        >
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            {
                              WEEKDAYS[
                                date.getDay()
                              ]
                            }
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                            {date.getDate()}
                          </p>
                        </button>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7">
                    {weekDays.map(
                      (date) => {
                        const dateEvents =
                          eventsForDate(
                            date
                          );

                        return (
                          <div
                            key={date.toISOString()}
                            className="min-h-[520px] border-r border-slate-200 p-2 dark:border-slate-800"
                          >
                            <div className="space-y-2">
                              {dateEvents.length ===
                                0 && (
                                <p className="py-8 text-center text-[10px] text-slate-300">
                                  No events
                                </p>
                              )}

                              {dateEvents.map(
                                (
                                  event
                                ) =>
                                  renderEvent(
                                    event
                                  )
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="mb-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Selected Day
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {formatLongDate(
                      selectedDate
                    )}
                  </p>
                </div>

                {dayEvents.length ===
                0 ? (
                  <div className="py-16 text-center">
                    <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />

                    <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      No events scheduled
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Your court diary is clear for this day.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayEvents.map(
                      (event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() =>
                            setSelectedEvent(
                              event
                            )
                          }
                          className={`w-full rounded-xl border p-4 text-left transition hover:shadow-sm ${eventClass(
                            event.type
                          )}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 rounded-lg bg-white/70 p-2">
                              {eventIcon(
                                event.type
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">
                                  {
                                    event.title
                                  }
                                </h3>

                                {event.status && (
                                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[9px] font-bold uppercase">
                                    {statusLabel(
                                      event.status
                                    )}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs opacity-80">
                                {formatTime(
                                  event.date
                                )}{" "}
                                ·{" "}
                                {
                                  event.subtitle
                                }
                              </p>

                              {event.court && (
                                <p className="mt-1 text-xs opacity-70">
                                  {event.court}
                                  {event.courtRoom
                                    ? ` · Courtroom ${event.courtRoom}`
                                    : ""}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Upcoming */}
          <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 p-5 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Upcoming
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Next scheduled activities
              </p>
            </div>

            <div className="p-4">
              {upcomingEvents.length ===
              0 ? (
                <div className="py-12 text-center">
                  <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    No upcoming events
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(
                    (event) => (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => {
                          const date =
                            new Date(
                              event.date
                            );

                          selectDate(
                            date
                          );

                          setSelectedEvent(
                            event
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                      >
                        <div className="flex gap-3">
                          <div
                            className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${eventDotClass(
                              event.type
                            )}`}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                              {
                                event.title
                              }
                            </p>

                            <p className="mt-1 text-[10px] text-slate-500">
                              {new Date(
                                event.date
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-slate-400">
                              {
                                event.subtitle
                              }
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() =>
              setSelectedEvent(null)
            }
            aria-label="Close"
          />

          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2.5 ${eventClass(
                    selectedEvent.type
                  )}`}
                >
                  {eventIcon(
                    selectedEvent.type
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    {selectedEvent.type.replace(
                      "_",
                      " "
                    )}
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {
                      selectedEvent.title
                    }
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(
                    null
                  )
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 h-4 w-4 text-slate-400" />

                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Date & Time
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {new Date(
                      selectedEvent.date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatTime(
                      selectedEvent.date
                    )}
                  </p>
                </div>
              </div>

              {selectedEvent.caseNumber && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-slate-400" />

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Case
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {
                        selectedEvent.caseNumber
                      }
                    </p>

                    {selectedEvent.caseTitle && (
                      <p className="text-xs text-slate-500">
                        {
                          selectedEvent.caseTitle
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.court && (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Court
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                      {
                        selectedEvent.court
                      }
                    </p>

                    {selectedEvent.courtRoom && (
                      <p className="text-xs text-slate-500">
                        Courtroom{" "}
                        {
                          selectedEvent.courtRoom
                        }
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.description && (
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Details
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {
                      selectedEvent.description
                    }
                  </p>
                </div>
              )}

              {selectedEvent.status && (
                <div>
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {statusLabel(
                      selectedEvent.status
                    )}
                  </span>
                </div>
              )}

              {selectedEvent.caseId && (
                <Link
                  href={`/advocate/cases/${selectedEvent.caseId}`}
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                >
                  <FileText className="h-4 w-4" />
                  Open Case
                </Link>
              )}

              {selectedEvent.type ===
                "HEARING" && (
                <Link
                  href="/advocate/hearings"
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Scale className="h-4 w-4" />
                  Manage Hearings
                </Link>
              )}

              {selectedEvent.type ===
                "TASK" && (
                <Link
                  href="/advocate/tasks"
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ListTodo className="h-4 w-4" />
                  Manage Tasks
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}