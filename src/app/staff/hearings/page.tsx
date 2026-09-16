"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  RefreshCw,
  Search,
  Clock3,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

import HearingTable from "@/components/hearings/HearingTable";
import type { HearingRecord } from "@/components/hearings/HearingForm";

type RawHearing = {
  id: string;
  createdAt?: string | Date | null;
  status: string;
  courtRoom: string | null;
  caseId: string;
  date: string | Date;
  remarks: string | null;
  nextDate: string | Date | null;
  hearingType: string | null;
  orderPassed: string | null;

  case?: {
    id: string;
    caseNumber: string;
    title: string;
    court: string;
    status?: string | null;

    client?: {
      id: string;
      name: string;
    } | null;

    advocate?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

function normalizeHearing(
  hearing: RawHearing
): HearingRecord {
  return {
    id: hearing.id,

    createdAt: hearing.createdAt ?? null,

    status: hearing.status,

    courtRoom: hearing.courtRoom,

    caseId: hearing.caseId,

    date:
      hearing.date instanceof Date
        ? hearing.date.toISOString()
        : new Date(hearing.date).toISOString(),

    remarks: hearing.remarks,

    nextDate: hearing.nextDate
      ? hearing.nextDate instanceof Date
        ? hearing.nextDate.toISOString()
        : new Date(hearing.nextDate).toISOString()
      : null,

    hearingType: hearing.hearingType,

    orderPassed: hearing.orderPassed,

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

export default function AdminHearingsPage() {
  const [hearings, setHearings] = useState<
    HearingRecord[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

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
          data?.error ||
            data?.message ||
            "Unable to load hearings."
        );
      }

      const rawHearings: RawHearing[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.hearings)
          ? data.hearings
          : [];

      setHearings(
        rawHearings.map(normalizeHearing)
      );
    } catch (err) {
      console.error(
        "ADMIN_HEARINGS_LOAD_ERROR:",
        err
      );

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

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/hearings",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load hearings."
          );
        }

        if (cancelled) {
          return;
        }

        const rawHearings: RawHearing[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.hearings)
              ? data.hearings
              : [];

        setHearings(
          rawHearings.map(normalizeHearing)
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "ADMIN_HEARINGS_INITIAL_LOAD_ERROR:",
          err
        );

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

      const searchableText = [
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

      return searchableText.includes(term);
    });
  }, [hearings, search, status]);

  const stats = useMemo(() => {
    return {
      total: hearings.length,

      scheduled: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() ===
          "SCHEDULED"
      ).length,

      completed: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() ===
          "COMPLETED"
      ).length,

      adjourned: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() ===
          "ADJOURNED"
      ).length,

      cancelled: hearings.filter(
        (hearing) =>
          hearing.status.toUpperCase() ===
          "CANCELLED"
      ).length,
    };
  }, [hearings]);

  return (
    <main className="min-h-full bg-gray-100 p-4 text-gray-900 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                Hearings
              </h1>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Manage court hearings and upcoming proceedings.
              </p>
            </div>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={loadHearings}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={15}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <Link
              href="/staff/hearings/new"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Add Hearing
            </Link>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-semibold hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

          {/* Total */}
          <button
            type="button"
            onClick={() => setStatus("ALL")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
              status === "ALL"
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-500">
                Total
              </span>

              <CalendarDays
                size={17}
                className="text-blue-600"
              />

            </div>

            <p className="mt-2 text-2xl font-bold">
              {stats.total}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              All hearings
            </p>
          </button>

          {/* Scheduled */}
          <button
            type="button"
            onClick={() => setStatus("SCHEDULED")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
              status === "SCHEDULED"
                ? "border-blue-500 ring-2 ring-blue-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-500">
                Scheduled
              </span>

              <Clock3
                size={17}
                className="text-blue-600"
              />

            </div>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {stats.scheduled}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Upcoming hearings
            </p>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => setStatus("COMPLETED")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
              status === "COMPLETED"
                ? "border-emerald-500 ring-2 ring-emerald-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-500">
                Completed
              </span>

              <CheckCircle2
                size={17}
                className="text-emerald-600"
              />

            </div>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {stats.completed}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Completed hearings
            </p>
          </button>

          {/* Adjourned */}
          <button
            type="button"
            onClick={() => setStatus("ADJOURNED")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
              status === "ADJOURNED"
                ? "border-amber-500 ring-2 ring-amber-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-500">
                Adjourned
              </span>

              <AlertCircle
                size={17}
                className="text-amber-600"
              />

            </div>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {stats.adjourned}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Adjourned hearings
            </p>
          </button>

          {/* Cancelled */}
          <button
            type="button"
            onClick={() => setStatus("CANCELLED")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow ${
              status === "CANCELLED"
                ? "border-red-500 ring-2 ring-red-100"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-gray-500">
                Cancelled
              </span>

              <XCircle
                size={17}
                className="text-red-600"
              />

            </div>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {stats.cancelled}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Cancelled hearings
            </p>
          </button>

        </div>

        {/* Search / Filter */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row">

            <div className="relative flex-1">

              <Search
                size={17}
                className="absolute left-3 top-3 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search case, client, court, hearing type..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="SCHEDULED">
                Scheduled
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="ADJOURNED">
                Adjourned
              </option>

              <option value="CANCELLED">
                Cancelled
              </option>
            </select>

          </div>

        </div>

        {/* Results */}
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-2 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-semibold text-gray-900">
                Hearing List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredHearings.length} of{" "}
                {hearings.length} hearings
              </p>
            </div>

            {status !== "ALL" && (
              <button
                type="button"
                onClick={() => setStatus("ALL")}
                className="text-left text-sm font-semibold text-blue-600 hover:text-blue-700 sm:text-right"
              >
                Clear Filter
              </button>
            )}

          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">

              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-gray-500">
                Loading hearings...
              </p>

            </div>
          ) : filteredHearings.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <CalendarDays
                size={40}
                className="mx-auto text-gray-300"
              />

              <h3 className="mt-4 font-semibold text-gray-900">
                No hearings found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>

              <Link
                href="/staff/hearings/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={16} />
                Add Hearing
              </Link>

            </div>
          ) : (
            <div className="overflow-x-auto">
              <HearingTable
  hearings={filteredHearings}
  onEdit={(hearing) => {
    window.location.href = `/staff/hearings/${hearing.id}/edit`;
  }}
  onDelete={async (hearing) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hearing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/hearings/${hearing.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete hearing."
        );
      }

      await loadHearings();
    } catch (error) {
      console.error(
        "Delete hearing error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete hearing."
      );
    }
  }}
/>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}