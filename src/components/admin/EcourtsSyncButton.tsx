"use client";

import { useState } from "react";

export default function EcourtsSyncButton({
  cnrNumber,
}: {
  cnrNumber: string;
}) {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSync() {
    if (!cnrNumber) {
      setError("CNR number is missing.");
      return;
    }

    setSyncing(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/ecourts/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnrNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to synchronize case."
        );
      }

      setMessage(
        data?.message ||
          "Case synchronized successfully."
      );

      /*
       * Reload the Server Component so that:
       *
       * - Last Synced updates
       * - eCourts Status updates
       * - Timeline shows the new sync event
       * - Other case information is refreshed
       */
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (err) {
      console.error("eCourts sync error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to synchronize case."
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <svg
          className={`h-4 w-4 ${
            syncing ? "animate-spin" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M21 12a9 9 0 0 1-15.5 6.2L3 16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M3 12a9 9 0 0 1 15.5-6.2L21 8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M21 3v5h-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M3 21v-5h5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {syncing ? "Syncing..." : "Sync from eCourts"}
      </button>

      {message && (
        <p className="max-w-xs text-right text-xs font-medium text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p className="max-w-xs text-right text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}