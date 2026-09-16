"use client";

import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Link2,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type RelatedCase = {
  id: string;
  caseNumber?: string | null;
  caseType?: string | null;
  title: string;
  court: string;
  status: string;
  caseStage?: string | null;
  client?: {
    id: string;
    name: string;
  } | null;
};

type RelatedCaseItem = {
  id: string;
  relationType: string;
  createdAt: string | Date;
  case: RelatedCase;
};

type CaseSearchItem = {
  id: string;
  caseNumber?: string | null;
  title: string;
  court: string;
  status: string;
  caseType?: string | null;
  client?: {
    name: string;
  } | null;
};

type RelatedCasesProps = {
  caseId: string;
};

const RELATION_TYPES = [
  {
    value: "CONNECTED_CASE",
    label: "Connected Case",
  },
  {
    value: "APPEAL",
    label: "Appeal",
  },
  {
    value: "REVISION",
    label: "Revision",
  },
  {
    value: "RELATED",
    label: "Related Case",
  },
  {
    value: "CROSS_CASE",
    label: "Cross Case",
  },
  {
    value: "COUNTER_CASE",
    label: "Counter Case",
  },
  {
    value: "TRANSFERRED_CASE",
    label: "Transferred Case",
  },
  {
    value: "SAME_PARTIES",
    label: "Same Parties",
  },
  {
    value: "SAME_SUBJECT",
    label: "Same Subject",
  },
  {
    value: "OTHER",
    label: "Other",
  },
];

function getRelationLabel(value: string) {
  const relation = RELATION_TYPES.find(
    (item) => item.value === value
  );

  if (relation) {
    return relation.label;
  }

  return value.replaceAll("_", " ");
}

function getStatusClasses(status: string) {
  const normalized = status.toUpperCase();

  if (
    normalized === "ACTIVE" ||
    normalized === "OPEN"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    normalized === "CLOSED" ||
    normalized === "DISPOSED"
  ) {
    return "bg-gray-100 text-gray-600 border-gray-200";
  }

  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function RelatedCases({
  caseId,
}: RelatedCasesProps) {
  const [relatedCases, setRelatedCases] =
    useState<RelatedCaseItem[]>([]);

  const [searchResults, setSearchResults] =
    useState<CaseSearchItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] =
    useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [search, setSearch] = useState("");
  const [selectedCaseId, setSelectedCaseId] =
    useState("");

  const [relationType, setRelationType] =
    useState("RELATED");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * Load related cases.
   */
  useEffect(() => {
    let cancelled = false;

    const loadRelatedCases = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/related-cases`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load related cases."
          );
        }

        if (!cancelled) {
          setRelatedCases(
            data.relatedCases ?? []
          );
        }
      } catch (err) {
        console.error(
          "Related cases load error:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load related cases."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRelatedCases();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  /*
   * Search cases.
   *
   * Important:
   * We do NOT clear searchResults inside this effect
   * when the query is shorter than two characters.
   *
   * The input handler handles that immediately.
   */
  useEffect(() => {
    const query = search.trim();

    if (
      query.length < 2 ||
      !showModal
    ) {
      return;
    }

    let cancelled = false;

    const timer = window.setTimeout(
      async () => {
        try {
          setSearching(true);

          const response = await fetch(
            `/api/cases?search=${encodeURIComponent(
              query
            )}`,
            {
              cache: "no-store",
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data?.error ||
                "Failed to search cases."
            );
          }

          if (!cancelled) {
            const cases: CaseSearchItem[] =
              Array.isArray(data)
                ? data
                : data.cases ?? [];

            setSearchResults(
              cases.filter(
                (item) =>
                  item.id !== caseId
              )
            );
          }
        } catch (err) {
          console.error(
            "Case search error:",
            err
          );

          if (!cancelled) {
            setSearchResults([]);
          }
        } finally {
          if (!cancelled) {
            setSearching(false);
          }
        }
      },
      300
    );

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search, showModal, caseId]);

  /*
   * Search input handler.
   *
   * Clearing results happens here rather than
   * inside an effect.
   */
  function handleSearchChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const newQuery = event.target.value;

    setSearch(newQuery);
    setSelectedCaseId("");

    if (newQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
    }
  }

  function resetForm() {
    setSearch("");
    setSearchResults([]);
    setSelectedCaseId("");
    setRelationType("RELATED");
    setError("");
    setSuccess("");
  }

  function openModal() {
    resetForm();
    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  }

  function selectCase(item: CaseSearchItem) {
    setSelectedCaseId(item.id);

    setSearch(
      item.caseNumber
        ? `${item.caseNumber} — ${item.title}`
        : item.title
    );

    setSearchResults([]);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!selectedCaseId) {
      setError("Please select a case.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(
        `/api/cases/${caseId}/related-cases`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            relatedCaseId: selectedCaseId,
            relationType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to add related case."
        );
      }

      setRelatedCases((current) => [
        data.relatedCase,
        ...current,
      ]);

      setSuccess(
        "Related case added successfully."
      );

      window.setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 500);
    } catch (err) {
      console.error(
        "Related case create error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add related case."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    relationId: string
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this related case?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(relationId);
      setError("");

      const response = await fetch(
        `/api/cases/${caseId}/related-cases?relationId=${encodeURIComponent(
          relationId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to remove related case."
        );
      }

      setRelatedCases((current) =>
        current.filter(
          (item) => item.id !== relationId
        )
      );
    } catch (err) {
      console.error(
        "Related case delete error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove related case."
      );
    } finally {
      setDeletingId("");
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link2
              size={18}
              className="text-indigo-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Related Cases
              </h2>

              <p className="text-[11px] text-gray-400">
                Cases connected to this matter
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openModal}
            className="flex w-fit items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={14} />
            Add Related Case
          </button>
        </div>

        {error && !showModal && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle
              size={15}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-32 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2
                size={16}
                className="animate-spin"
              />

              Loading related cases...
            </div>
          </div>
        ) : relatedCases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <Briefcase size={18} />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No related cases
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Link appeals, connected matters,
              cross-cases, or other related cases.
            </p>

            <button
              type="button"
              onClick={openModal}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Add First Related Case
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {relatedCases.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                      <Briefcase size={17} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-700">
                          {getRelationLabel(
                            item.relationType
                          )}
                        </span>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${getStatusClasses(
                            item.case.status
                          )}`}
                        >
                          {item.case.status}
                        </span>
                      </div>

                      <h3 className="mt-2 text-xs font-bold text-gray-900">
                        {item.case.title}
                      </h3>

                      <div className="mt-1 space-y-0.5 text-[10px] text-gray-500">
                        <p>
                          Case No:{" "}
                          <span className="font-semibold text-gray-700">
                            {item.case.caseNumber ||
                              "-"}
                          </span>
                        </p>

                        <p>
                          Court:{" "}
                          <span className="font-semibold text-gray-700">
                            {item.case.court ||
                              "-"}
                          </span>
                        </p>

                        {item.case.client && (
                          <p>
                            Client:{" "}
                            <span className="font-semibold text-gray-700">
                              {item.case.client.name}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/advocate/cases/${item.case.id}`}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Open case"
                    >
                      <ArrowUpRight size={14} />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      disabled={
                        deletingId === item.id
                      }
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove relationship"
                    >
                      {deletingId === item.id ? (
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Add Related Case
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  Connect another case to this matter
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  <AlertCircle
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{success}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="related-case-search"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Search Case
                </label>

                <div className="relative">
                  <input
                    id="related-case-search"
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search by case number or title..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    disabled={saving}
                  />

                  {searching && (
                    <Loader2
                      size={14}
                      className="absolute right-3 top-3 animate-spin text-gray-400"
                    />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          selectCase(item)
                        }
                        className="block w-full border-b border-gray-100 p-3 text-left transition last:border-b-0 hover:bg-indigo-50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-gray-800">
                            {item.caseNumber ||
                              "No Case Number"}
                          </span>

                          <span className="text-[9px] text-gray-400">
                            {item.status}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-[11px] text-gray-600">
                          {item.title}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-gray-400">
                          {item.court}

                          {item.client
                            ? ` • ${item.client.name}`
                            : ""}
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {search.trim().length >= 2 &&
                  !searching &&
                  searchResults.length === 0 &&
                  !selectedCaseId && (
                    <p className="mt-2 text-[10px] text-gray-400">
                      No matching cases found.
                    </p>
                  )}
              </div>

              <div>
                <label
                  htmlFor="relation-type"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Relation Type
                </label>

                <select
                  id="relation-type"
                  value={relationType}
                  onChange={(event) =>
                    setRelationType(
                      event.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  {RELATION_TYPES.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || !selectedCaseId
                  }
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : "Add Related Case"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}