"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Download,
  File,
  FileText,
  Filter,
  Loader2,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

type DocumentItem = {
  id: string;
  name: string;
  fileUrl: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  documentDate: string | null;
  isImportant: boolean;
  fileSize: number | null;
  mimeType: string | null;
  uploadedAt: string;
  updatedAt: string;
};

type CaseInfo = {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
};

type CaseDocumentsProps = {
  caseId: string;
  clientId?: string | null;
  evidenceOnly?: boolean;
};

const CATEGORIES = [
  "General",
  "Pleadings",
  "Evidence",
  "Orders",
  "Judgments",
  "Affidavits",
  "Agreements",
  "Correspondence",
  "Identity",
  "Financial",
  "Medical",
  "Police",
  "Court",
  "Other",
];

function formatFileSize(bytes: number | null) {
  if (!bytes || bytes <= 0) return "—";

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(date: string | null) {
  if (!date) return "No date";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "No date";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileExtension(name: string) {
  const parts = name.split(".");

  if (parts.length < 2) {
    return "FILE";
  }

  return parts[parts.length - 1].toUpperCase();
}

function getFileIcon(mimeType: string | null) {
  if (mimeType?.includes("pdf")) {
    return <FileText className="h-5 w-5" />;
  }

  if (mimeType?.startsWith("image/")) {
    return <File className="h-5 w-5" />;
  }

  return <FileText className="h-5 w-5" />;
}

export default function CaseDocuments({
  caseId,
  clientId,
  evidenceOnly = false,
}: CaseDocumentsProps) {
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === "ADMIN";

  const [caseInfo, setCaseInfo] =
    useState<CaseInfo | null>(null);

  const [caseLoading, setCaseLoading] =
    useState(true);

  const [documents, setDocuments] =
    useState<DocumentItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [importantOnly, setImportantOnly] =
    useState(false);

  const [showUploadForm, setShowUploadForm] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [title, setTitle] =
    useState("");

  const [category, setCategory] =
    useState(evidenceOnly ? "Evidence" : "General");

  const [subcategory, setSubcategory] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [documentDate, setDocumentDate] =
    useState("");

  const [isImportant, setIsImportant] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
   * ----------------------------------------------------------
   * LOAD CASE INFORMATION
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      if (!caseId) {
        setCaseInfo(null);
        setCaseLoading(false);
        return;
      }

      try {
        setCaseLoading(true);

        const response = await fetch(
          `/api/cases/${encodeURIComponent(caseId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load case."
          );
        }

        const currentCase =
          data?.case ?? data;

        if (!cancelled) {
          setCaseInfo({
            id: currentCase.id,
            caseNumber:
              currentCase.caseNumber ||
              "No case number",
            title:
              currentCase.title ||
              "Untitled Case",
            court:
              currentCase.court ||
              "Court not specified",
          });
        }
      } catch (err) {
        console.error(
          "CASE_DOCUMENTS_CASE_LOAD_ERROR:",
          err
        );

        if (!cancelled) {
          setCaseInfo(null);
        }
      } finally {
        if (!cancelled) {
          setCaseLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  /*
   * ----------------------------------------------------------
   * LOAD DOCUMENTS
   * ----------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadDocuments() {
      if (!caseId) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * Clear previous case immediately.
         *
         * This prevents documents from Case A being visible
         * while Case B is loading.
         */
        setDocuments([]);

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (categoryFilter) {
          params.set(
            "category",
            categoryFilter
          );
        }

        if (importantOnly) {
          params.set(
            "important",
            "true"
          );
        }

        /*
         * Evidence page is always restricted to
         * Evidence category.
         */
        if (evidenceOnly) {
          params.set(
            "category",
            "Evidence"
          );
        }

        const query = params.toString();

        const response = await fetch(
          `/api/cases/${encodeURIComponent(
            caseId
          )}/documents${
            query ? `?${query}` : ""
          }`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Failed to load documents."
          );
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.documents)
            ? data.documents
            : [];

        if (!cancelled) {
          /*
           * Extra frontend protection for Evidence page.
           * The server is still the authoritative filter.
           */
          const visibleDocuments =
            evidenceOnly
              ? list.filter(
                  (document: DocumentItem) =>
                    document.category
                      ?.trim()
                      .toLowerCase() ===
                    "evidence"
                )
              : list;

          setDocuments(
            visibleDocuments
          );
        }
      } catch (err) {
        console.error(
          "CASE_DOCUMENTS_LOAD_ERROR:",
          err
        );

        if (!cancelled) {
          setDocuments([]);

          setError(
            err instanceof Error
              ? err.message
              : "Failed to load documents."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timer = setTimeout(
      loadDocuments,
      200
    );

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    caseId,
    search,
    categoryFilter,
    importantOnly,
    evidenceOnly,
  ]);

  /*
   * ----------------------------------------------------------
   * RESET FORM
   * ----------------------------------------------------------
   */

  function resetForm() {
    setSelectedFile(null);
    setTitle("");

    setCategory(
      evidenceOnly
        ? "Evidence"
        : "General"
    );

    setSubcategory("");
    setDescription("");
    setDocumentDate("");
    setIsImportant(false);
  }

  function openUploadForm() {
    setError("");
    setSuccess("");

    resetForm();

    setShowUploadForm(true);
  }

  function closeUploadForm() {
    if (uploading) {
      return;
    }

    resetForm();

    setShowUploadForm(false);

    setError("");
  }

  /*
   * ----------------------------------------------------------
   * UPLOAD
   * ----------------------------------------------------------
   */

  async function handleUpload(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!caseId) {
      setError(
        "Please select a case before uploading."
      );
      return;
    }

    if (!selectedFile) {
      setError(
        evidenceOnly
          ? "Please select an evidence file."
          : "Please select a document to upload."
      );
      return;
    }

    if (
      evidenceOnly &&
      category !== "Evidence"
    ) {
      setError(
        "Evidence uploads must use the Evidence category."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "title",
        title.trim() ||
          selectedFile.name
      );

      /*
       * Evidence page always sends Evidence.
       */
      formData.append(
        "category",
        evidenceOnly
          ? "Evidence"
          : category
      );

      formData.append(
        "subcategory",
        subcategory.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "documentDate",
        documentDate
      );

      formData.append(
        "isImportant",
        isImportant
          ? "true"
          : "false"
      );

      /*
       * CRITICAL CASE MAPPING
       */
      formData.append(
        "caseId",
        caseId
      );

      /*
       * Do not trust clientId as the authoritative
       * case relationship. The API will use the
       * selected case's real client.
       */
      if (clientId) {
        formData.append(
          "clientId",
          clientId
        );
      }

      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Document upload failed."
        );
      }

      resetForm();

      setShowUploadForm(false);

      setSuccess(
        evidenceOnly
          ? "Evidence uploaded successfully."
          : "Document uploaded successfully."
      );

      /*
       * Reload the selected case only.
       */
      const params =
        new URLSearchParams();

      if (search.trim()) {
        params.set(
          "search",
          search.trim()
        );
      }

      if (evidenceOnly) {
        params.set(
          "category",
          "Evidence"
        );
      } else if (categoryFilter) {
        params.set(
          "category",
          categoryFilter
        );
      }

      if (importantOnly) {
        params.set(
          "important",
          "true"
        );
      }

      const query =
        params.toString();

      const refreshResponse =
        await fetch(
          `/api/cases/${encodeURIComponent(
            caseId
          )}/documents${
            query
              ? `?${query}`
              : ""
          }`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

      if (refreshResponse.ok) {
        const refreshData =
          await refreshResponse.json();

        const list = Array.isArray(
          refreshData
        )
          ? refreshData
          : Array.isArray(
                refreshData?.documents
              )
            ? refreshData.documents
            : [];

        setDocuments(
          evidenceOnly
            ? list.filter(
                (document: DocumentItem) =>
                  document.category
                    ?.trim()
                    .toLowerCase() ===
                  "evidence"
              )
            : list
        );
      }

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "CASE_DOCUMENTS_UPLOAD_ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Document upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  /*
   * ----------------------------------------------------------
   * DELETE
   * ----------------------------------------------------------
   */

  async function handleDelete(
    documentId: string
  ) {
    /*
     * UI protection.
     *
     * API protection is also implemented separately.
     */
    if (!isAdmin) {
      setError(
        "Delete permission denied. Only an administrator can delete records."
      );
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this document?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(documentId);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/cases/${encodeURIComponent(
            caseId
          )}/documents/${encodeURIComponent(
            documentId
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Failed to delete document."
        );
      }

      setDocuments(
        (current) =>
          current.filter(
            (document) =>
              document.id !==
              documentId
          )
      );

      setSuccess(
        "Document deleted successfully."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(
        "CASE_DOCUMENTS_DELETE_ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete document."
      );
    } finally {
      setDeletingId(null);
    }
  }

  /*
   * ----------------------------------------------------------
   * OPEN / DOWNLOAD
   * ----------------------------------------------------------
   */

  function handleOpenDocument(
    document: DocumentItem
  ) {
    window.open(
      document.fileUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleDownload(
    document: DocumentItem
  ) {
    const link =
      window.document.createElement(
        "a"
      );

    link.href =
      document.fileUrl;

    link.download =
      document.name;

    link.target = "_blank";

    link.rel =
      "noopener noreferrer";

    window.document.body.appendChild(
      link
    );

    link.click();

    link.remove();
  }

  const filteredCount =
    useMemo(
      () =>
        evidenceOnly
          ? documents.filter(
              (document) =>
                document.category
                  ?.trim()
                  .toLowerCase() ===
                "evidence"
            ).length
          : documents.length,
      [documents, evidenceOnly]
    );

  /*
   * ----------------------------------------------------------
   * RENDER
   * ----------------------------------------------------------
   */

  return (
    <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {evidenceOnly
                  ? "Evidence Documents"
                  : "Case Documents"}
              </h2>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {filteredCount}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {evidenceOnly
                ? "Manage evidence documents associated with this case."
                : "Manage pleadings, evidence, orders and other case-related documents."}
            </p>
          </div>

          <button
            type="button"
            onClick={openUploadForm}
            disabled={!caseId}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />

            {evidenceOnly
              ? "Upload Evidence"
              : "Upload Document"}
          </button>
        </div>

        {/* SEARCH / FILTERS */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder={
                evidenceOnly
                  ? "Search evidence..."
                  : "Search documents..."
              }
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
            />
          </div>

          {!evidenceOnly ? (
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <select
                value={
                  categoryFilter
                }
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value
                  )
                }
                className="w-full min-w-[170px] appearance-none rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-8 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              >
                <option value="">
                  All Categories
                </option>

                {CATEGORIES.map(
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
          ) : (
            <div className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400">
              <FileText className="h-4 w-4" />
              Evidence
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setImportantOnly(
                (value) => !value
              )
            }
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
              importantOnly
                ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                : "border-gray-300 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
            }`}
          >
            <Star
              className={`h-4 w-4 ${
                importantOnly
                  ? "fill-current"
                  : ""
              }`}
            />

            Important
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {(error || success) && (
        <div className="px-5 pt-5 sm:px-6">
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{success}</span>
            </div>
          )}
        </div>
      )}

      {/* DOCUMENTS */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading{" "}
              {evidenceOnly
                ? "evidence"
                : "documents"}
              ...
            </div>
          </div>
        ) : documents.length ===
          0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 text-center dark:border-gray-700">
            <div className="mb-4 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>

            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              {evidenceOnly
                ? "No evidence found"
                : "No documents found"}
            </h3>

            <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
              {evidenceOnly
                ? "No evidence documents are currently associated with this case."
                : "Upload case documents, evidence, pleadings, orders and other important files."}
            </p>

            <button
              type="button"
              onClick={openUploadForm}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />

              {evidenceOnly
                ? "Upload First Evidence"
                : "Upload First Document"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(
              (document) => (
                <div
                  key={document.id}
                  className="group rounded-2xl border border-gray-200 p-4 transition hover:border-blue-200 hover:shadow-sm dark:border-gray-800 dark:hover:border-blue-900"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    {/* FILE */}
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                        {getFileIcon(
                          document.mimeType
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenDocument(
                                document
                              )
                            }
                            className="truncate text-left text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
                            title={
                              document.name
                            }
                          >
                            {document.name}
                          </button>

                          {document.isImportant && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              <Star className="h-3 w-3 fill-current" />
                              Important
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {document.category ||
                              "General"}
                          </span>

                          {document.subcategory && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                {
                                  document.subcategory
                                }
                              </span>
                            </>
                          )}

                          <span>
                            •
                          </span>

                          <span>
                            {getFileExtension(
                              document.name
                            )}
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {formatFileSize(
                              document.fileSize
                            )}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          {document.documentDate && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />

                              Document:{" "}
                              {formatDate(
                                document.documentDate
                              )}
                            </span>
                          )}

                          <span>
                            Uploaded:{" "}
                            {formatDate(
                              document.uploadedAt
                            )}
                          </span>
                        </div>

                        {document.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                            {
                              document.description
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex shrink-0 items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800 lg:border-0 lg:pt-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenDocument(
                            document
                          )
                        }
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            document
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              document.id
                            )
                          }
                          disabled={
                            deletingId ===
                            document.id
                          }
                          className="inline-flex items-center justify-center rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                          title="Delete document"
                        >
                          {deletingId ===
                          document.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {showUploadForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900 sm:p-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {evidenceOnly
                    ? "Upload Evidence"
                    : "Upload Case Document"}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {evidenceOnly
                    ? "Add evidence to this case."
                    : "Add a document to this case."}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeUploadForm
                }
                disabled={uploading}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                handleUpload
              }
              className="space-y-5 p-5 sm:p-6"
            >
              {/* CASE MAPPING */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Document will be mapped to this case
                    </p>

                    {caseLoading ? (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading case information...
                      </div>
                    ) : caseInfo ? (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {caseInfo.caseNumber}
                        </p>

                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {caseInfo.title}
                        </p>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {caseInfo.court}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-red-600">
                        Unable to load case information.
                      </p>
                    )}

                    {/* Actual case ID submitted to API */}
                    <input
                      type="hidden"
                      name="caseId"
                      value={caseId}
                    />
                  </div>
                </div>
              </div>

              {/* FILE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  {evidenceOnly
                    ? "Evidence File"
                    : "Document File"}{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50 dark:border-gray-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20">
                  <Upload className="mb-3 h-8 w-8 text-gray-400" />

                  {selectedFile ? (
                    <>
                      <p className="max-w-full truncate text-sm font-medium text-gray-900 dark:text-white">
                        {
                          selectedFile.name
                        }
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatFileSize(
                          selectedFile.size
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to select a file
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        PDF, Word, images and other case files
                      </p>
                    </>
                  )}

                  <input
                    type="file"
                    className="hidden"
                    onChange={(
                      event
                    ) => {
                      const file =
                        event.target
                          .files?.[0] ||
                        null;

                      setSelectedFile(
                        file
                      );

                      if (
                        file &&
                        !title
                      ) {
                        setTitle(
                          file.name
                        );
                      }
                    }}
                  />
                </label>
              </div>

              {/* TITLE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Document Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(
                    event
                  ) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. FIR Copy, Bail Application, Sale Agreement"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* CATEGORY */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Category
                  </label>

                  {evidenceOnly ? (
                    <div className="flex h-[42px] items-center rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-400">
                      Evidence
                    </div>
                  ) : (
                    <select
                      value={
                        category
                      }
                      onChange={(
                        event
                      ) =>
                        setCategory(
                          event.target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    >
                      {CATEGORIES.map(
                        (item) => (
                          <option
                            key={item}
                            value={
                              item
                            }
                          >
                            {item}
                          </option>
                        )
                      )}
                    </select>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                    Subcategory
                  </label>

                  <input
                    type="text"
                    value={
                      subcategory
                    }
                    onChange={(
                      event
                    ) =>
                      setSubcategory(
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional"
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />
                </div>
              </div>

              {/* DATE */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Document Date
                </label>

                <input
                  type="date"
                  value={
                    documentDate
                  }
                  onChange={(
                    event
                  ) =>
                    setDocumentDate(
                      event.target
                        .value
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Description
                </label>

                <textarea
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  rows={4}
                  placeholder="Add notes or a short description of this document..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>

              {/* IMPORTANT */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
                <input
                  type="checkbox"
                  checked={
                    isImportant
                  }
                  onChange={(
                    event
                  ) =>
                    setIsImportant(
                      event.target
                        .checked
                    )
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <Star className="h-4 w-4 text-amber-500" />
                    Mark as important
                  </div>

                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    Important documents appear at the top of the case document list.
                  </p>
                </div>
              </label>

              {/* ERROR */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
                <button
                  type="button"
                  onClick={
                    closeUploadForm
                  }
                  disabled={
                    uploading
                  }
                  className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    uploading ||
                    !selectedFile ||
                    !caseId ||
                    caseLoading
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />

                      {evidenceOnly
                        ? "Upload Evidence"
                        : "Upload Document"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}