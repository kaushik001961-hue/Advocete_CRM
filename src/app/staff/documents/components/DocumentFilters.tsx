"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface Client {
  id: string;
  name: string;
}

interface CaseItem {
  id: string;
  title: string;
  clientId: string;
}

interface DocumentFiltersProps {
  clients: Client[];
  cases: CaseItem[];
  search: string;
  category: string;
  clientId: string;
  caseId: string;
}

const categories = [
  "Pleading",
  "Petition",
  "Evidence",
  "Court Order",
];

export default function DocumentFilters({
  clients,
  cases,
  search,
  category,
  clientId,
  caseId,
}: DocumentFiltersProps) {
  const [selectedClient, setSelectedClient] = useState(clientId);
  const [selectedCase, setSelectedCase] = useState(caseId);

  /*
   * Only show cases belonging to the selected client.
   */
  const filteredCases = useMemo(() => {
    if (!selectedClient) {
      return cases;
    }

    return cases.filter(
      (caseItem) => caseItem.clientId === selectedClient
    );
  }, [cases, selectedClient]);

  /*
   * When client changes, check whether the currently
   * selected case belongs to that client.
   *
   * If it doesn't, clear the case selection.
   */
  useEffect(() => {
    if (!selectedClient) {
      setSelectedCase("");
      return;
    }

    const caseBelongsToClient = cases.some(
      (caseItem) =>
        caseItem.id === selectedCase &&
        caseItem.clientId === selectedClient
    );

    if (!caseBelongsToClient) {
      setSelectedCase("");
    }
  }, [selectedClient, selectedCase, cases]);

  function handleClientChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newClientId = event.target.value;

    setSelectedClient(newClientId);

    // Always reset case when changing client.
    setSelectedCase("");
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(selectedClient) ||
    Boolean(selectedCase);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <form
        method="GET"
        action="/staff/documents"
        className="space-y-4"
      >
        {/* Search */}
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search Document
          </label>

          <input
            id="search"
            name="search"
            type="text"
            defaultValue={search}
            placeholder="Search by document name..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Category */}
          <div>
            <label
              htmlFor="category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Category
            </label>

            <select
              id="category"
              name="category"
              defaultValue={category}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label
              htmlFor="clientId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Client
            </label>

            <select
              id="clientId"
              name="clientId"
              value={selectedClient}
              onChange={handleClientChange}
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">All Clients</option>

              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Case */}
          <div>
            <label
              htmlFor="caseId"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Case
            </label>

            <select
              id="caseId"
              name="caseId"
              value={selectedCase}
              onChange={(event) =>
                setSelectedCase(event.target.value)
              }
              className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                {selectedClient
                  ? filteredCases.length > 0
                    ? "All Cases"
                    : "No cases for this client"
                  : "All Cases"}
              </option>

              {filteredCases.map((caseItem) => (
                <option key={caseItem.id} value={caseItem.id}>
                  {caseItem.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Search / Filter
          </button>

          {hasFilters && (
            <Link
              href="/staff/documents"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reset Filters
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}