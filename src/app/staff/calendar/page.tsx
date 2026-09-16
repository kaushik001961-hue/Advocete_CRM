"use client";

/* eslint-disable react/no-unescaped-entities */


import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";

import HearingCalendar from "@/components/hearings/HearingCalendar";
import type { HearingRecord } from "@/components/hearings/HearingForm";

function statusIcon(status: string) {
  const value = status.toUpperCase();

  if (value === "COMPLETED") {
    return <CheckCircle2 size={16} />;
  }

  if (value === "ADJOURNED") {
    return <AlertCircle size={16} />;
  }

  if (value === "CANCELLED") {
    return <XCircle size={16} />;
  }

  return <Clock3 size={16} />;
}

function normalizeHearing(hearing: {
  id: string;
  date: Date | string;
  remarks?: string | null;
  nextDate?: Date | string | null;
  status: string;
  courtRoom?: string | null;
  hearingType?: string | null;
  orderPassed?: string | null;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
    court?: string | null;
    client?: {
      id: string;
      name: string;
    } | null;
  } | null;
}): HearingRecord {
  return {
    id: hearing.id,

    date:
      hearing.date instanceof Date
        ? hearing.date.toISOString()
        : new Date(hearing.date).toISOString(),

    remarks: hearing.remarks ?? null,

    nextDate:
      hearing.nextDate instanceof Date
        ? hearing.nextDate.toISOString()
        : hearing.nextDate
          ? new Date(hearing.nextDate).toISOString()
          : null,

    status: hearing.status,

    courtRoom: hearing.courtRoom ?? null,

    hearingType: hearing.hearingType ?? null,

    orderPassed: hearing.orderPassed ?? null,

    case: hearing.case
      ? {
          id: hearing.case.id,
          caseNumber: hearing.case.caseNumber,
          title: hearing.case.title,
          court: hearing.case.court ?? "",
          client: hearing.case.client
            ? {
                id: hearing.case.client.id,
                name: hearing.case.client.name,
              }
            : null,
        }
      : null,
  };
}

export default function AdminCalendarPage() {
  const [hearings, setHearings] = useState<HearingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [selectedHearing, setSelectedHearing] =
    useState<HearingRecord | null>(null);

  async function loadHearings() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/hearings", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Unable to load hearings."
        );
      }

      const rawHearings = Array.isArray(data)
        ? data
        : Array.isArray(data?.hearings)
          ? data.hearings
          : [];

      const normalizedHearings: HearingRecord[] =
        rawHearings.map(normalizeHearing);

      setHearings(normalizedHearings);
    } catch (err) {
      console.error("ADMIN_CALENDAR_LOAD_ERROR", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hearings."
      );

      setHearings([]);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Initial page load.
   *
   * We intentionally do not call loadHearings() directly from
   * the effect because the React hooks lint rule flags that
   * pattern when loadHearings contains state updates.
   */
  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/hearings", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load hearings."
          );
        }

        if (cancelled) {
          return;
        }

        const rawHearings = Array.isArray(data)
          ? data
          : Array.isArray(data?.hearings)
            ? data.hearings
            : [];

        const normalizedHearings: HearingRecord[] =
          rawHearings.map(normalizeHearing);

        setHearings(normalizedHearings);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("ADMIN_CALENDAR_INITIAL_LOAD_ERROR", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load hearings."
        );

        setHearings([]);
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

  const filteredHearings = useMemo(() => {
    const term = search.trim().toLowerCase();

    return hearings.filter((hearing) => {
      const matchesStatus =
        status === "ALL" ||
        hearing.status.toUpperCase() === status;

      if (!matchesStatus) {
        return false;
      }

      if (!term) {
        return true;
      }

      const haystack = [
        hearing.case?.caseNumber,
        hearing.case?.title,
        hearing.case?.court,
        hearing.case?.client?.name,
        hearing.hearingType,
        hearing.courtRoom,
        hearing.remarks,
        hearing.orderPassed,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [hearings, search, status]);

  const counts = useMemo(() => {
    return {
      total: hearings.length,

      scheduled: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() === "SCHEDULED"
      ).length,

      completed: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() === "COMPLETED"
      ).length,

      adjourned: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() === "ADJOURNED"
      ).length,
    };
  }, [hearings]);

  function handleSelectHearing(hearing: HearingRecord) {
    setSelectedHearing(hearing);
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <CalendarDays size={20} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Court Calendar
                </h1>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  View and manage hearings and court proceedings.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={loadHearings}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </header>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <button
                type="button"
                onClick={loadHearings}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">

          {/* Total */}
          <button
            type="button"
            onClick={() => setStatus("ALL")}
            className="rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Total Hearings
              </p>

              <span className="text-gray-500">
                <CalendarDays size={16} />
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
              {counts.total}
            </p>
          </button>

          {/* Scheduled */}
          <button
            type="button"
            onClick={() => setStatus("SCHEDULED")}
            className="rounded-2xl border border-gray-200 bg-blue-50 p-4 text-left shadow-sm transition hover:border-blue-300 dark:border-gray-800 dark:bg-blue-950/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                Scheduled
              </p>

              <span className="text-blue-600 dark:text-blue-400">
                {statusIcon("SCHEDULED")}
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-400">
              {counts.scheduled}
            </p>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => setStatus("COMPLETED")}
            className="rounded-2xl border border-gray-200 bg-emerald-50 p-4 text-left shadow-sm transition hover:border-emerald-300 dark:border-gray-800 dark:bg-emerald-950/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                Completed
              </p>

              <span className="text-emerald-600 dark:text-emerald-400">
                {statusIcon("COMPLETED")}
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {counts.completed}
            </p>
          </button>

          {/* Adjourned */}
          <button
            type="button"
            onClick={() => setStatus("ADJOURNED")}
            className="rounded-2xl border border-gray-200 bg-amber-50 p-4 text-left shadow-sm transition hover:border-amber-300 dark:border-gray-800 dark:bg-amber-950/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                Adjourned
              </p>

              <span className="text-amber-600 dark:text-amber-400">
                {statusIcon("ADJOURNED")}
              </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-400">
              {counts.adjourned}
            </p>
          </button>
        </section>

        {/* Filters */}
        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={15}
              className="absolute left-3 top-2.5 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search case, client, court..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-xs text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-semibold text-gray-600 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="ADJOURNED">Adjourned</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </section>

        {/* Calendar */}
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
            Loading hearings...
          </div>
        ) : (
          <HearingCalendar
            hearings={filteredHearings}
            onSelect={handleSelectHearing}
          />
        )}

        {/* Selected Hearing */}
        {selectedHearing && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                  Selected Hearing
                </p>

                <h2 className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                  {selectedHearing.case?.caseNumber || "Case"}
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedHearing.case?.title || "No case title"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHearing(null)}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Date
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(
                    selectedHearing.date
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Time
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(
                    selectedHearing.date
                  ).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Hearing Type
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedHearing.hearingType || "Not specified"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedHearing.status
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/\b\w/g, (letter) =>
                      letter.toUpperCase()
                    )}
                </p>
              </div>
            </div>

            {selectedHearing.case?.client && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Client
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedHearing.case.client.name}
                </p>
              </div>
            )}

            {selectedHearing.courtRoom && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Court Room
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedHearing.courtRoom}
                </p>
              </div>
            )}

            {selectedHearing.remarks && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Remarks
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {selectedHearing.remarks}
                </p>
              </div>
            )}

            {selectedHearing.orderPassed && (
              <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-950">
                <p className="text-[10px] font-semibold uppercase text-gray-400">
                  Order Passed
                </p>

                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {selectedHearing.orderPassed}
                </p>
              </div>
            )}

            {selectedHearing.nextDate && (
              <div className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/30">
                <p className="text-[10px] font-semibold uppercase text-blue-600 dark:text-blue-400">
                  Next Hearing Date
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
                  {new Date(
                    selectedHearing.nextDate
                  ).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* No results */}
        {!loading && filteredHearings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
              No hearings found
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Try changing your search or status filter.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}