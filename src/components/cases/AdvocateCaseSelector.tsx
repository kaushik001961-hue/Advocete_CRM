"use client";

import { useEffect, useState } from "react";

type CaseOption = {
  id: string;
  caseNumber?: string | null;
  title?: string | null;
  court?: string | null;
  status?: string | null;
};

type AdvocateCaseSelectorProps = {
  value: string;
  onChange: (caseId: string) => void;
};

export default function AdvocateCaseSelector({
  value,
  onChange,
}: AdvocateCaseSelectorProps) {
  const [cases, setCases] = useState<CaseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/cases", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load cases (${response.status})`
          );
        }

        const data = await response.json();

        /*
         * The cases API may return either:
         *
         *   [...]
         *
         * or:
         *
         *   { cases: [...] }
         */
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.cases)
            ? data.cases
            : [];

        if (!cancelled) {
          setCases(list);
        }
      } catch (err) {
        console.error("Error loading advocate cases:", err);

        if (!cancelled) {
          setError("Unable to load your cases.");
          setCases([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCases();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="advocate-case-selector"
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        Select Case
      </label>

      <select
        id="advocate-case-selector"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-100"
      >
        <option value="">
          {loading
            ? "Loading your cases..."
            : cases.length === 0
              ? "No assigned cases found"
              : "Select a case"}
        </option>

        {cases.map((item) => {
          const caseNumber =
            item.caseNumber?.trim() || "No case number";

          const title =
            item.title?.trim() || "Untitled Case";

          return (
            <option key={item.id} value={item.id}>
              {caseNumber} — {title}
              {item.court ? ` — ${item.court}` : ""}
            </option>
          );
        })}
      </select>

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && cases.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">
          Select one of your assigned cases to continue.
        </p>
      )}

      {!loading && !error && cases.length === 0 && (
        <p className="mt-2 text-xs text-slate-500">
          No cases are currently assigned to your advocate account.
        </p>
      )}
    </div>
  );
}