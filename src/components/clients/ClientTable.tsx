"use client";

import Link from "next/link";
import {
  Eye,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

export interface ClientRow {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  _count?: {
    cases: number;
    documents: number;
    invoices: number;
  };
}

interface ClientTableProps {
  clients: ClientRow[];
  onEdit: (client: ClientRow) => void;
  onDelete: (client: ClientRow) => void;
}

export default function ClientTable({
  clients,
  onEdit,
  onDelete,
}: ClientTableProps) {
  if (clients.length === 0) {
    return (
      <div className="py-16 text-center">
        <UserRound className="mx-auto h-10 w-10 text-slate-300" />

        <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
          No clients found
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Add your first client to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-950">
            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Client
            </th>

            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Contact
            </th>

            <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Location
            </th>

            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Cases
            </th>

            <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Documents
            </th>

            <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {clients.map((client) => (
            <tr
              key={client.id}
              className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
            >
              <td className="px-5 py-4">
                <Link
                  href={`/advocate/clients/${client.id}`}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    {client.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                      {client.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Client ID: {client.id}
                    </p>
                  </div>
                </Link>
              </td>

              <td className="px-5 py-4">
                <div className="space-y-1">
                  {client.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {client.phone}
                    </p>
                  )}

                  {client.email && (
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {client.email}
                    </p>
                  )}

                  {!client.phone &&
                    !client.email && (
                      <span className="text-xs text-slate-400">
                        No contact details
                      </span>
                    )}
                </div>
              </td>

              <td className="px-5 py-4">
                {client.city ||
                client.state ? (
                  <p className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <MapPin className="h-3 w-3 text-slate-400" />

                    {[
                      client.city,
                      client.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                ) : (
                  <span className="text-xs text-slate-400">
                    —
                  </span>
                )}
              </td>

              <td className="px-5 py-4 text-center">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                  {client._count?.cases ?? 0}
                </span>
              </td>

              <td className="px-5 py-4 text-center">
                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-purple-50 px-2 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                  {client._count?.documents ?? 0}
                </span>
              </td>

              <td className="px-5 py-4">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/advocate/clients/${client.id}`}
                    title="View Client"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    title="Edit Client"
                    onClick={() =>
                      onEdit(client)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-amber-600 dark:hover:bg-slate-800"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    title="Delete Client"
                    onClick={() =>
                      onDelete(client)
                    }
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
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