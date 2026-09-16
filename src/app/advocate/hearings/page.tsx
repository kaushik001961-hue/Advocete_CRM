"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  AlertCircle,
  XCircle,
  Plus,
  Search,
  RefreshCw,
  X,
  Filter,
} from "lucide-react";

import HearingCalendar from "@/components/hearings/HearingCalendar";
import HearingForm, {
  type HearingCase,
  type HearingRecord,
} from "@/components/hearings/HearingForm";
import HearingTable from "@/components/hearings/HearingTable";

type CaseOption = {
  id: string;
  caseNumber: string;
  title: string;
  court?: string | null;
};

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

export default function AdvocateHearingsPage() {
  const [hearings, setHearings] = useState<HearingRecord[]>([]);
  const [cases, setCases] = useState<CaseOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [view, setView] = useState<"LIST" | "CALENDAR">("LIST");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<HearingRecord | null>(null);

  const [initialCaseId, setInitialCaseId] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [hearingResponse, caseResponse] = await Promise.all([
        fetch("/api/hearings", {
          method: "GET",
          cache: "no-store",
        }),
        fetch("/api/cases", {
          method: "GET",
          cache: "no-store",
        }),
      ]);

      const hearingData = await hearingResponse.json();
      const caseData = await caseResponse.json();

      if (!hearingResponse.ok) {
        throw new Error(
          hearingData?.message || "Unable to load hearings."
        );
      }

      if (!caseResponse.ok) {
        throw new Error(
          caseData?.message || "Unable to load cases."
        );
      }

      setHearings(
        Array.isArray(hearingData)
          ? hearingData
          : hearingData?.hearings || []
      );

      setCases(
        Array.isArray(caseData)
          ? caseData
          : caseData?.cases || []
      );
    } catch (err) {
      console.error("ADVOCATE_HEARINGS_LOAD_ERROR", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hearing data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [hearingResponse, caseResponse] = await Promise.all([
          fetch("/api/hearings", {
            method: "GET",
            cache: "no-store",
          }),
          fetch("/api/cases", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const hearingData = await hearingResponse.json();
        const caseData = await caseResponse.json();

        if (!hearingResponse.ok) {
          throw new Error(
            hearingData?.message || "Unable to load hearings."
          );
        }

        if (!caseResponse.ok) {
          throw new Error(
            caseData?.message || "Unable to load cases."
          );
        }

        if (cancelled) {
          return;
        }

        setHearings(
          Array.isArray(hearingData)
            ? hearingData
            : hearingData?.hearings || []
        );

        setCases(
          Array.isArray(caseData)
            ? caseData
            : caseData?.cases || []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "ADVOCATE_HEARINGS_INITIAL_LOAD_ERROR",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load hearing data."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
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

  function openCreate(caseId?: string) {
    setEditing(null);
    setInitialCaseId(caseId || "");
    setFormOpen(true);
  }

  function openEdit(hearing: HearingRecord) {
    setEditing(hearing);
    setInitialCaseId("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
    setInitialCaseId("");
  }

  async function deleteHearing(hearing: HearingRecord) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this hearing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/hearings/${hearing.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Failed to delete hearing."
        );
      }

      setHearings((current) =>
        current.filter((item) => item.id !== hearing.id)
      );
    } catch (err) {
      console.error(
        "ADVOCATE_HEARING_DELETE_ERROR",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete hearing."
      );
    }
  }

  function handleSaved(savedHearing?: HearingRecord) {
    if (savedHearing) {
      setHearings((current) => {
        const exists = current.some(
          (item) => item.id === savedHearing.id
        );

        if (exists) {
          return current.map((item) =>
            item.id === savedHearing.id
              ? savedHearing
              : item
          );
        }

        return [savedHearing, ...current];
      });
    } else {
      void loadData();
    }

    closeForm();
  }

  const normalizedCases: HearingCase[] = cases.map((item) => ({
    id: item.id,
    caseNumber: item.caseNumber,
    title: item.title,
    court: item.court ?? "",
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-900 dark:bg-gray-950 dark:text-white md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        <header className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <CalendarDays size={20} />
            </div>

            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Hearings
              </h1>

              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Manage court hearings and upcoming proceedings.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => openCreate()}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={15} />
              Add Hearing
            </button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg border border-red-200 px-3 py-1.5 font-semibold hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

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

          <div className="flex flex-wrap items-center gap-2">
            <Filter
              size={15}
              className="text-gray-400"
            />

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

            <div className="flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setView("LIST")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  view === "LIST"
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                List
              </button>

              <button
                type="button"
                onClick={() => setView("CALENDAR")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  view === "CALENDAR"
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
              >
                Calendar
              </button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400 dark:border-gray-800 dark:bg-gray-900">
            Loading hearings...
          </div>
        ) : view === "CALENDAR" ? (
          <HearingCalendar
            hearings={filtered}
            onSelect={openEdit}
          />
        ) : (
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Hearing List
              </h2>

              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {filtered.length} hearing
                {filtered.length === 1 ? "" : "s"} found.
              </p>
            </div>

            <HearingTable
              hearings={filtered}
              onEdit={openEdit}
              onDelete={deleteHearing}
            />
          </section>
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
            <CalendarDays className="mx-auto h-10 w-10 text-gray-300" />

            <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">
              No hearings found
            </h3>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Create a hearing or change your filters.
            </p>

            <button
              type="button"
              onClick={() => openCreate()}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={14} />
              Add Hearing
            </button>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editing ? "Edit Hearing" : "Add Hearing"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Enter the court proceeding details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X size={17} />
              </button>
            </div>

            <div className="p-5">
              <HearingForm
                cases={normalizedCases}
                hearing={editing}
                initialCaseId={initialCaseId}
                onClose={closeForm}
                onSaved={handleSaved}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}