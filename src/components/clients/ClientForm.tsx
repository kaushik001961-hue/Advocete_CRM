"use client";

import { useState } from "react";

export interface ClientData {
  id?: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  notes?: string | null;
}

interface ClientFormProps {
  initialData?: ClientData;

  // Used by the existing Admin client page
  action?: (formData: FormData) => Promise<void>;

  // Used by Advocate Client Management
  onSuccess?: (client?: ClientData) => void;
  onCancel?: () => void;
}

export default function ClientForm({
  initialData,
  action,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = Boolean(initialData?.id);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    try {
      /*
       * Existing Admin page uses a server action.
       */
      if (action) {
        await action(formData);

        onSuccess?.(initialData);

        return;
      }

      /*
       * Advocate Client Management uses the API.
       */
      const payload = {
        name: String(formData.get("name") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        address: String(formData.get("address") ?? "").trim(),
        city: String(formData.get("city") ?? "").trim(),
        state: String(formData.get("state") ?? "").trim(),
        pincode: String(formData.get("pincode") ?? "").trim(),
        notes: String(formData.get("notes") ?? "").trim(),
      };

      if (!payload.name) {
        setError("Client name is required.");
        return;
      }

      const url = isEditing
        ? `/api/clients/${initialData?.id}`
        : "/api/clients";

      const response = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error || "Failed to save client."
        );
      }

      onSuccess?.(result);
    } catch (err) {
      console.error("Client form error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save client. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Client Name *
        </label>

        <input
          name="name"
          defaultValue={initialData?.name ?? ""}
          placeholder="Enter client name"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Phone + Email */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Phone
          </label>

          <input
            name="phone"
            type="tel"
            defaultValue={initialData?.phone ?? ""}
            placeholder="Enter phone number"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Email
          </label>

          <input
            name="email"
            type="email"
            defaultValue={initialData?.email ?? ""}
            placeholder="Enter email address"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Address
        </label>

        <textarea
          name="address"
          defaultValue={initialData?.address ?? ""}
          placeholder="Enter address"
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* City / State / Pincode */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            City
          </label>

          <input
            name="city"
            defaultValue={initialData?.city ?? ""}
            placeholder="City"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            State
          </label>

          <input
            name="state"
            defaultValue={initialData?.state ?? ""}
            placeholder="State"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Pincode
          </label>

          <input
            name="pincode"
            defaultValue={initialData?.pincode ?? ""}
            placeholder="Pincode"
            inputMode="numeric"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Notes
        </label>

        <textarea
          name="notes"
          defaultValue={initialData?.notes ?? ""}
          placeholder="Additional notes"
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Update Client"
              : "Save Client"}
        </button>
      </div>
    </form>
  );
}