"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import ClientForm, {
  type ClientData,
} from "@/components/clients/ClientForm";

import ClientTable, {
  type ClientRow,
} from "@/components/clients/ClientTable";

export default function AdvocateClientsPage() {
  const [clients, setClients] =
    useState<ClientRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] =
    useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [editingClient, setEditingClient] =
    useState<ClientData | undefined>();

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  async function loadClients(
    refresh = false
  ) {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        "/api/clients",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to load clients."
        );
      }

      setClients(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Client load error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load clients."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        const response = await fetch(
          "/api/clients",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Unable to load clients."
          );
        }

        setClients(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Initial client load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load clients."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredClients = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return clients;
    }

    return clients.filter((client) =>
      [
        client.name,
        client.phone,
        client.email,
        client.city,
        client.state,
      ]
        .filter(Boolean)
        .some((field) =>
          String(field)
            .toLowerCase()
            .includes(value)
        )
    );
  }, [clients, search]);

  const stats = useMemo(() => {
    return {
      total: clients.length,

      withCases: clients.filter(
        (client) =>
          (client._count?.cases ?? 0) > 0
      ).length,

      withDocuments: clients.filter(
        (client) =>
          (client._count?.documents ?? 0) >
          0
      ).length,

      totalCases: clients.reduce(
        (sum, client) =>
          sum +
          (client._count?.cases ?? 0),
        0
      ),
    };
  }, [clients]);

  function openCreate() {
    setEditingClient(undefined);
    setShowForm(true);
  }

  function openEdit(client: ClientRow) {
    setEditingClient({
      id: client.id,
      name: client.name,
      phone: client.phone,
      email: client.email,
      city: client.city,
      state: client.state,
    });

    setShowForm(true);
  }

  async function handleDelete(
    client: ClientRow
  ) {
    const confirmed =
      window.confirm(
        `Delete "${client.name}"?\n\nThis cannot be done if the client has linked cases, documents or invoices.`
      );

    if (!confirmed) return;

    try {
      setDeletingId(client.id);
      setError("");

      const response = await fetch(
        `/api/clients/${client.id}`,
        {
          method: "DELETE",
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result?.error ||
            "Unable to delete client."
        );
      }

      setClients((current) =>
        current.filter(
          (item) =>
            item.id !== client.id
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete client."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleSuccess() {
    setShowForm(false);
    setEditingClient(undefined);
    void loadClients(true);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 dark:bg-white">
              <UserRound className="h-5 w-5 text-white dark:text-slate-900" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                Client Management
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage clients and their legal matters.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadClients(true)
              }
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Clients
              </span>

              <UserRound className="h-4 w-4 text-blue-500" />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Clients With Cases
              </span>

              <BriefcaseBusiness className="h-4 w-4 text-emerald-500" />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.withCases}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Cases
              </span>

              <BriefcaseBusiness className="h-4 w-4 text-purple-500" />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.totalCases}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Clients With Documents
              </span>

              <FileText className="h-4 w-4 text-orange-500" />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {stats.withDocuments}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by client name, phone, email or location..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-blue-950"
            />
          </div>
        </div>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Clients
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {filteredClients.length} client
                {filteredClients.length !==
                1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading clients...
            </div>
          ) : (
            <ClientTable
              clients={filteredClients}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          )}
        </section>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() =>
              setShowForm(false)
            }
            className="absolute inset-0 cursor-default"
            aria-label="Close"
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  {editingClient
                    ? "Edit Client"
                    : "Add New Client"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {editingClient
                    ? "Update client information."
                    : "Create a new client record."}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <ClientForm
                initialData={
                  editingClient
                }
                onSuccess={
                  handleSuccess
                }
                onCancel={() =>
                  setShowForm(false)
                }
              />
            </div>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-xl">
          <Loader2 className="h-4 w-4 animate-spin" />
          Deleting client...
        </div>
      )}
    </main>
  );
}