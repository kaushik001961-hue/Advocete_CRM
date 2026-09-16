"use client";

import { Calendar, CheckCircle2, Clock, Edit3, Trash2, AlertCircle, XCircle } from "lucide-react";
import type { HearingRecord } from "./HearingForm";

type Props = {
  hearings: HearingRecord[];
  onEdit: (hearing: HearingRecord) => void;
  onDelete: (hearing: HearingRecord) => void;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusClasses(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED": return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "ADJOURNED": return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED": return "border-red-200 bg-red-50 text-red-700";
    default: return "border-blue-200 bg-blue-50 text-blue-700";
  }
}

function StatusIcon({ status }: { status: string }) {
  const value = status.toUpperCase();
  if (value === "COMPLETED") return <CheckCircle2 size={12} />;
  if (value === "ADJOURNED") return <AlertCircle size={12} />;
  if (value === "CANCELLED") return <XCircle size={12} />;
  return <Clock size={12} />;
}

export default function HearingTable({ hearings, onEdit, onDelete }: Props) {
  if (hearings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
        <Calendar className="mx-auto h-9 w-9 text-gray-300" />
        <p className="mt-3 text-sm font-semibold text-gray-600">No hearings found</p>
        <p className="mt-1 text-xs text-gray-400">Add a hearing to start the court proceedings history.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-left">
        <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-4 py-3">Date & Time</th>
            <th className="px-4 py-3">Case</th>
            <th className="px-4 py-3">Hearing</th>
            <th className="px-4 py-3">Court Room</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
          {hearings.map((hearing) => (
            <tr key={hearing.id} className="transition hover:bg-gray-50/70">
              <td className="px-4 py-4 align-top">
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                  <Calendar size={14} className="text-blue-500" />
                  {formatDate(hearing.date)}
                </div>
                {hearing.nextDate && (
                  <p className="mt-1 pl-5 text-[10px] text-gray-400">
                    Next: {formatDate(hearing.nextDate)}
                  </p>
                )}
              </td>
              <td className="max-w-[250px] px-4 py-4 align-top">
                <p className="font-mono font-bold text-blue-700">{hearing.case?.caseNumber || "—"}</p>
                <p className="mt-1 truncate font-semibold text-gray-900">{hearing.case?.title || "Unknown case"}</p>
                <p className="mt-0.5 text-[10px] text-gray-400">{hearing.case?.court || ""}</p>
              </td>
              <td className="max-w-[250px] px-4 py-4 align-top">
                <p className="font-semibold text-gray-800">{hearing.hearingType || "Court proceeding"}</p>
                {hearing.remarks && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-gray-500">{hearing.remarks}</p>}
                {hearing.orderPassed && <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-blue-600">Order: {hearing.orderPassed}</p>}
              </td>
              <td className="px-4 py-4 align-top text-gray-500">{hearing.courtRoom || "—"}</td>
              <td className="px-4 py-4 align-top">
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClasses(hearing.status)}`}>
                  <StatusIcon status={hearing.status} /> {hearing.status}
                </span>
              </td>
              <td className="px-4 py-4 align-top text-right">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(hearing)} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600" title="Edit hearing">
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => onDelete(hearing)} className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600" title="Delete hearing">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
