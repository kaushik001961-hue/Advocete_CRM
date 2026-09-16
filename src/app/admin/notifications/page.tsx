"use client";

import { useState } from "react";

export default function NotificationsPage() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function sendTestEmail() {
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "/api/notifications/test-email",
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to send test email."
        );
      }

      setMessage(
        "Test notification created successfully. Please check the logged-in user's email."
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to send test email."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Notifications
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage and test ACMS email notifications.
        </p>
      </div>

      {/* Email Test Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Email Notifications
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              Send a test notification to the email address
              associated with your currently logged-in account.
            </p>
          </div>

          <div className="hidden rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 sm:block">
            Email
          </div>
        </div>

        {/* Status */}
        {message && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={sendTestEmail}
            disabled={sending}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Test Email"}
          </button>
        </div>
      </div>

      {/* Configuration Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Notification Configuration
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Email Provider
            </p>

            <p className="mt-1 font-medium text-gray-900">
              Resend
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Notification Type
            </p>

            <p className="mt-1 font-medium text-gray-900">
              Email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}