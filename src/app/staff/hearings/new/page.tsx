"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import HearingForm, {
  type HearingCase,
  type HearingRecord,
} from "@/components/hearings/HearingForm";

export default function NewHearingPage() {
  const [cases, setCases] = useState<HearingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCases() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/cases", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load cases."
          );
        }

        const rawCases = Array.isArray(data)
          ? data
          : data?.cases || [];

        if (!cancelled) {
          setCases(
            rawCases.map(
              (item: {
                id: string;
                caseNumber: string;
                title: string;
                court?: string | null;
              }) => ({
                id: item.id,
                caseNumber: item.caseNumber,
                title: item.title,
                court: item.court ?? "",
              })
            )
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load cases."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCases();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSaved(_hearing?: HearingRecord) {
    window.location.href = "/staff/hearings";
  }

  function handleClose() {
    window.location.href = "/staff/hearings";
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/staff/hearings"
          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft size={18} />
        </Link>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Hearing
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create a new court hearing.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-gray-500">
            <Loader2
              size={18}
              className="mr-2 animate-spin"
            />
            Loading cases...
          </div>
        ) : (
          <HearingForm
            cases={cases}
            onSaved={handleSaved}
            onClose={handleClose}
          />
        )}
      </div>
    </main>
  );
}