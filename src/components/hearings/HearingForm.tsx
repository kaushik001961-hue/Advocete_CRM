"use client";

import { useState } from "react";

export type HearingRecord = {
  id: string;

  createdAt?: string | Date | null;

  status: string;

  courtRoom: string | null;

  caseId?: string;

  date: string;

  remarks: string | null;

  nextDate: string | null;

  hearingType: string | null;

  orderPassed: string | null;

  case?: {
    id: string;
    caseNumber: string;
    title: string;
    court: string;

    client?: {
      id: string;
      name: string;
    } | null;
  } | null;
};

export type HearingCase = {
  id: string;
  caseNumber: string;
  title: string;
  court: string;

  client?: {
    id: string;
    name: string;
  } | null;
};

type Props = {
  hearing?: HearingRecord | null;
  cases: HearingCase[];
  initialCaseId?: string;
  onSaved?: (hearing?: HearingRecord) => void;
  onClose?: () => void;
};

const hearingTypes = [
  "First Hearing",
  "Admission / Notice",
  "Arguments",
  "Evidence",
  "Cross Examination",
  "Final Hearing",
  "Order / Judgment",
  "Bail",
  "Mentioning",
  "Compliance",
  "Other",
];

const statuses = [
  "SCHEDULED",
  "COMPLETED",
  "ADJOURNED",
  "CANCELLED",
];

function formatDateTimeLocal(
  value: string | Date | null | undefined
): string {
  if (!value) {
    return "";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const hours = String(
    date.getHours()
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes()
  ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function HearingForm({
  hearing,
  cases,
  onSaved,
  onClose,
}: Props) {
  const [caseId, setCaseId] = useState(
    hearing?.caseId ||
      hearing?.case?.id ||
      (cases.length === 1
        ? cases[0].id
        : "")
  );

  const [date, setDate] = useState(
    formatDateTimeLocal(
      hearing?.date
    )
  );

  const [nextDate, setNextDate] =
    useState(
      formatDateTimeLocal(
        hearing?.nextDate
      )
    );

  const [status, setStatus] =
    useState(
      hearing?.status ||
        "SCHEDULED"
    );

  const [hearingType, setHearingType] =
    useState(
      hearing?.hearingType ||
        "First Hearing"
    );

  const [courtRoom, setCourtRoom] =
    useState(
      hearing?.courtRoom || ""
    );

  const [remarks, setRemarks] =
    useState(
      hearing?.remarks || ""
    );

  const [orderPassed, setOrderPassed] =
    useState(
      hearing?.orderPassed || ""
    );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const isEdit = Boolean(
    hearing?.id
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!caseId) {
      setError(
        "Please select a case."
      );
      return;
    }

    if (!date) {
      setError(
        "Please select a hearing date."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        caseId,

        date: new Date(date).toISOString(),

        nextDate: nextDate
          ? new Date(
              nextDate
            ).toISOString()
          : null,

        status,

        hearingType:
          hearingType || null,

        courtRoom:
          courtRoom.trim() || null,

        remarks:
          remarks.trim() || null,

        orderPassed:
          orderPassed.trim() || null,
      };

      const response = await fetch(
        isEdit
          ? `/api/hearings/${hearing?.id}`
          : "/api/hearings",
        {
          method: isEdit
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to save hearing."
        );
      }

   if (onSaved) {
  onSaved(data);
}
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error(
        "HEARING_FORM_SAVE_ERROR",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save hearing."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Case */}
      <div>
        <label
          htmlFor="caseId"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Case
          <span className="ml-1 text-red-500">
            *
          </span>
        </label>

        <select
          id="caseId"
          value={caseId}
          onChange={(event) =>
            setCaseId(
              event.target.value
            )
          }
          required
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">
            Select Case
          </option>

          {cases.map((item) => (
            <option
              key={item.id}
              value={item.id}
            >
              {item.caseNumber} —{" "}
              {item.title}
            </option>
          ))}
        </select>

        {cases.length === 0 && (
          <p className="mt-2 text-xs text-gray-500">
            No cases are available.
          </p>
        )}
      </div>

      {/* Date + Next Date */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="hearingDate"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Hearing Date & Time
            <span className="ml-1 text-red-500">
              *
            </span>
          </label>

          <input
            id="hearingDate"
            type="datetime-local"
            value={date}
            onChange={(event) =>
              setDate(
                event.target.value
              )
            }
            required
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div>
          <label
            htmlFor="nextDate"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Next Hearing Date
          </label>

          <input
            id="nextDate"
            type="datetime-local"
            value={nextDate}
            onChange={(event) =>
              setNextDate(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Type + Status */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="hearingType"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Hearing Type
          </label>

          <select
            id="hearingType"
            value={hearingType}
            onChange={(event) =>
              setHearingType(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {hearingTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Status
          </label>

          <select
            id="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {statuses.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Court Room */}
      <div>
        <label
          htmlFor="courtRoom"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Court Room / Bench
        </label>

        <input
          id="courtRoom"
          type="text"
          value={courtRoom}
          onChange={(event) =>
            setCourtRoom(
              event.target.value
            )
          }
          placeholder="e.g. Court Hall 4"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Remarks */}
      <div>
        <label
          htmlFor="remarks"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Remarks
        </label>

        <textarea
          id="remarks"
          value={remarks}
          onChange={(event) =>
            setRemarks(
              event.target.value
            )
          }
          rows={4}
          placeholder="Enter hearing remarks..."
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Order Passed */}
      <div>
        <label
          htmlFor="orderPassed"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Order Passed
        </label>

        <textarea
          id="orderPassed"
          value={orderPassed}
          onChange={(event) =>
            setOrderPassed(
              event.target.value
            )
          }
          rows={4}
          placeholder="Enter order passed / court directions..."
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : isEdit
              ? "Update Hearing"
              : "Save Hearing"}
        </button>

      </div>
    </form>
  );
}