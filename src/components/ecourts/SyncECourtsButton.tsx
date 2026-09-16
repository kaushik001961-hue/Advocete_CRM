"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  cnrNumber: string;
};

export default function SyncECourtsButton({
  cnrNumber,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSync() {
    if (!cnrNumber) return;

    setLoading(true);
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
          data?.error || "Failed to synchronize eCourts."
        );
      }

      setMessage(
        data?.message ||
          "eCourts case synchronized successfully."
      );

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to synchronize eCourts."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw
          className={`h-4 w-4 ${
            loading ? "animate-spin" : ""
          }`}
        />

        {loading ? "Syncing..." : "Sync eCourts"}
      </button>

      {message && (
        <p className="text-xs font-medium text-green-600">
          {message}
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}