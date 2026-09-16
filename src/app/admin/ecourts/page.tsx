"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Scale,
  ShieldCheck,
  Info,
  RefreshCw,
  FileSearch,
  Download,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type Client = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type Advocate = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
};

type CasePreview = {
  cnrNumber: string;
  caseNumber: string;
  caseType: string;
  caseStage: string;
  title: string;
  court: string;
  status: string;
  bench: string;
  presidingJudge: string;
  courtRoom: string;
  opposingParty: string;
  opposingCounsel: string;
  counselPhone: string;
  filingDate: string;
  registrationNumber: string;
  registrationDate: string;
  firNumber: string;
  firDate: string;
  policeStation: string;
  sectionsActs: string;
  priority: string;
  description: string;
  tags: string;
  eCourtsStatus: string;
};

type ExistingCase = {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  status: string;
  caseType: string;
  caseStage: string;
  clientId: string;
  clientName: string;
  advocateId: string;
  advocateName: string;
  eCourtsStatus?: string | null;
  eCourtsLastSyncedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

const emptyPreview: CasePreview = {
  cnrNumber: "",
  caseNumber: "",
  caseType: "",
  caseStage: "FILED",
  title: "",
  court: "",
  status: "ACTIVE",
  bench: "",
  presidingJudge: "",
  courtRoom: "",
  opposingParty: "",
  opposingCounsel: "",
  counselPhone: "",
  filingDate: "",
  registrationNumber: "",
  registrationDate: "",
  firNumber: "",
  firDate: "",
  policeStation: "",
  sectionsActs: "",
  priority: "NORMAL",
  description: "",
  tags: "",
  eCourtsStatus: "",
};

export default function ECourtsPage() {
  const [cnrNumber, setCnrNumber] = useState("");
const [loading, setLoading] = useState(false);
const [importing, setImporting] = useState(false);
const [syncing, setSyncing] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [preview, setPreview] =
    useState<CasePreview | null>(null);

  const [existingCase, setExistingCase] =
    useState<ExistingCase | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);

  const [clientId, setClientId] = useState("");
  const [advocateId, setAdvocateId] = useState("");

  const [importedCaseId, setImportedCaseId] =
    useState("");

  useEffect(() => {
    async function loadOptions() {
      try {
        const [
          clientsResponse,
          advocatesResponse,
        ] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/advocates"),
        ]);

        if (clientsResponse.ok) {
          const clientData =
            await clientsResponse.json();

          if (Array.isArray(clientData)) {
            setClients(clientData);
          } else if (
            Array.isArray(clientData?.clients)
          ) {
            setClients(clientData.clients);
          }
        }

        if (advocatesResponse.ok) {
          const advocateData =
            await advocatesResponse.json();

          if (Array.isArray(advocateData)) {
            setAdvocates(advocateData);
          } else if (
            Array.isArray(advocateData?.advocates)
          ) {
            setAdvocates(
              advocateData.advocates
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load clients/advocates:",
          error
        );
      }
    }

    loadOptions();
  }, []);

  function updatePreview(
    field: keyof CasePreview,
    value: string
  ) {
    setPreview((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  async function handleSearch(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cnr = cnrNumber.trim().toUpperCase();

    setError("");
    setMessage("");
    setImportedCaseId("");
    setExistingCase(null);
    setPreview(null);

    if (!cnr) {
      setError("Please enter a CNR number.");
      return;
    }

    if (!/^[A-Z0-9]{16}$/.test(cnr)) {
      setError(
        "CNR number must contain exactly 16 alphanumeric characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/ecourts/search",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cnrNumber: cnr,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Unable to fetch case details."
        );
      }

      /*
       * EXISTING CASE
       *
       * The API found this CNR already imported
       * into ACMS.
       */
      if (
        data?.existingCaseFound &&
        data?.existingCase
      ) {
        setExistingCase(data.existingCase);

        setMessage(
          data?.message ||
            "This CNR number is already imported into ACMS."
        );

        return;
      }

      /*
       * NEW CASE
       *
       * Normal preview/import workflow.
       */
      const caseData = data?.case || {};

      setPreview({
        ...emptyPreview,
        ...caseData,
        cnrNumber: cnr,
        eCourtsStatus:
          caseData.eCourtsStatus ||
          "NOT_SYNCED",
      });

      setMessage(
        data?.configured
          ? "Case details retrieved successfully."
          : "CNR validated. The eCourts connection is not configured yet. You can review and enter case information below."
      );
    } catch (error) {
      console.error(
        "eCourts search error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to fetch case details."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setCnrNumber("");
    setPreview(null);
    setExistingCase(null);
    setClientId("");
    setAdvocateId("");
    setMessage("");
    setError("");
    setImportedCaseId("");
    setSyncing(false);
  }

  async function handleSyncCase() {
    if (!existingCase) {
      setError("Please search for an existing CNR case first.");
      return;
    }

    const cnr = cnrNumber.trim().toUpperCase();

    if (!/^[A-Z0-9]{16}$/.test(cnr)) {
      setError("CNR number must contain exactly 16 alphanumeric characters.");
      return;
    }

    setSyncing(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/ecourts/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnrNumber: cnr,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Failed to synchronize case."
        );
      }

      setExistingCase((current) =>
        current
          ? {
              ...current,
              caseNumber:
                data.case?.caseNumber ?? current.caseNumber,
              title:
                data.case?.title ?? current.title,
              court:
                data.case?.court ?? current.court,
              status:
                data.case?.status ?? current.status,
              caseType:
                data.case?.caseType ?? current.caseType,
              caseStage:
                data.case?.caseStage ?? current.caseStage,
              eCourtsStatus:
                data.case?.eCourtsStatus ?? current.eCourtsStatus,
              eCourtsLastSyncedAt:
                data.case?.eCourtsLastSyncedAt ?? new Date().toISOString(),
              updatedAt:
                data.case?.eCourtsLastSyncedAt ?? new Date().toISOString(),
            }
          : current
      );

      setMessage(
        data?.message ||
          `Case ${cnr} synchronized successfully.`
      );
    } catch (error) {
      console.error("eCourts sync error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to synchronize case."
      );
    } finally {
      setSyncing(false);
    }
  }

  async function handleImport() {
    if (!preview) {
      setError("Please search for a CNR first.");
      return;
    }

    setError("");
    setMessage("");
    setImportedCaseId("");

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!advocateId) {
      setError("Please select an advocate.");
      return;
    }

    if (!preview.caseNumber.trim()) {
      setError("Case number is required.");
      return;
    }

    if (!preview.caseType.trim()) {
      setError("Case type is required.");
      return;
    }

    if (!preview.title.trim()) {
      setError("Case title is required.");
      return;
    }

    if (!preview.court.trim()) {
      setError("Court is required.");
      return;
    }

    setImporting(true);

    try {
      const response = await fetch(
        "/api/ecourts/import",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...preview,
            clientId,
            advocateId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to import case."
        );
      }

      setImportedCaseId(
        data.case?.id || ""
      );

      setMessage(
        `Case ${preview.caseNumber} was successfully imported into ACMS.`
      );
    } catch (error) {
      console.error(
        "eCourts import error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to import case."
      );
    } finally {
      setImporting(false);
    }
  }

  function formatDate(
    value?: string | null
  ) {
    if (!value) {
      return "Never";
    }

    try {
      return new Date(value).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return value;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Scale className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                eCourts Integration
              </h1>

              <p className="text-sm text-slate-500">
                Search and import court case information into ACMS
              </p>
            </div>

          </div>
        </div>

        {/* Information Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">

          <InfoCard
            icon={<FileSearch className="h-5 w-5" />}
            title="Search Cases"
            text="Search a court case using its CNR number."
            iconClass="bg-blue-50 text-blue-600"
          />

          <InfoCard
            icon={<RefreshCw className="h-5 w-5" />}
            title="Import & Sync"
            text="Import case information into your ACMS database."
            iconClass="bg-green-50 text-green-600"
          />

          <InfoCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Secure Integration"
            text="eCourts connection will be handled through a secure server API."
            iconClass="bg-purple-50 text-purple-600"
          />

        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
            <div className="flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Search className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Search Case on eCourts
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the 16-character CNR number.
                </p>
              </div>

            </div>
          </div>

          <div className="p-5 sm:p-8">

            <form onSubmit={handleSearch}>

              <label
                htmlFor="cnrNumber"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                CNR Number
              </label>

              <div className="flex flex-col gap-3 lg:flex-row">

                <input
                  id="cnrNumber"
                  type="text"
                  value={cnrNumber}
                  onChange={(event) =>
                    setCnrNumber(
                      event.target.value
                        .toUpperCase()
                        .replace(/\s/g, "")
                    )
                  }
                  maxLength={16}
                  placeholder="Example: MHAU019999992015"
                  className="h-12 w-full rounded-xl border border-slate-300 px-4 font-medium uppercase tracking-wide outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5" />
                      Fetch Case Details
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading || importing || syncing}
                  className="h-12 rounded-xl border border-slate-300 px-5 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>

              </div>
            </form>

            <div className="mt-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <div className="text-sm text-blue-900">
                <p className="font-semibold">
                  CNR Number
                </p>

                <p className="mt-1 leading-6 text-blue-800">
                  Enter the 16-character alphanumeric CNR
                  number without spaces or hyphens.
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && !existingCase && (
              <div className="mt-5 flex gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{message}</span>
              </div>
            )}

          </div>
        </div>

        {/* Existing Case */}
        {existingCase && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">

            <div className="border-b border-blue-100 bg-blue-50 px-5 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-blue-950">
                      Existing Case Found
                    </h2>

                    <p className="mt-1 text-sm text-blue-700">
                      This CNR number is already registered in ACMS.
                    </p>
                  </div>

                </div>

                <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                  ALREADY IMPORTED
                </span>

              </div>
            </div>

            <div className="p-5 sm:p-8">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                <DetailCard
                  label="CNR Number"
                  value={cnrNumber}
                />

                <DetailCard
                  label="Case Number"
                  value={existingCase.caseNumber}
                />

                <DetailCard
                  label="Case Type"
                  value={existingCase.caseType}
                />

                <DetailCard
                  label="Case Title"
                  value={existingCase.title}
                  wide
                />

                <DetailCard
                  label="Court"
                  value={existingCase.court}
                />

                <DetailCard
                  label="Case Stage"
                  value={existingCase.caseStage}
                />

                <DetailCard
                  label="Status"
                  value={existingCase.status}
                />

                <DetailCard
                  label="Client"
                  value={
                    existingCase.clientName ||
                    "Not assigned"
                  }
                />

                <DetailCard
                  label="Advocate"
                  value={
                    existingCase.advocateName ||
                    "Not assigned"
                  }
                />

                <DetailCard
                  label="eCourts Status"
                  value={
                    existingCase.eCourtsStatus ||
                    "NOT SYNCED"
                  }
                />

                <DetailCard
                  label="Last Synced"
                  value={formatDate(
                    existingCase.eCourtsLastSyncedAt
                  )}
                />

              </div>

              {message && (
                <div className="mt-6 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <Info className="h-5 w-5 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

                <Link
                  href={`/admin/cases/${existingCase.id}`}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLink className="h-5 w-5" />
                  Open Case
                </Link>

                <button
                  type="button"
                  onClick={handleSyncCase}
                  disabled={syncing}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${
                      syncing ? "animate-spin" : ""
                    }`}
                  />
                  {syncing ? "Syncing..." : "Sync Case"}
                </button>

              </div>

              <p className="mt-3 text-right text-xs text-slate-500">
                Sync updates the existing ACMS case and records the synchronization in the case timeline.
              </p>

            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

              <div>
                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <FileSearch className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Case Import Preview
                    </h2>

                    <p className="text-sm text-slate-500">
                      Review the information before importing.
                    </p>
                  </div>

                </div>
              </div>

              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {preview.eCourtsStatus ||
                  "NOT SYNCED"}
              </span>

            </div>

            <div className="p-5 sm:p-8">

              {/* Assignment */}
              <SectionTitle title="ACMS Assignment" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <SelectField
                  label="Client"
                  value={clientId}
                  onChange={setClientId}
                  required
                  options={clients.map(
                    (client) => ({
                      value: client.id,
                      label: client.name,
                    })
                  )}
                  placeholder="Select client"
                />

                <SelectField
                  label="Advocate"
                  value={advocateId}
                  onChange={setAdvocateId}
                  required
                  options={advocates.map(
                    (advocate) => ({
                      value: advocate.id,
                      label: advocate.name,
                    })
                  )}
                  placeholder="Select advocate"
                />

              </div>

              {/* Basic Case Information */}
              <SectionTitle title="Case Information" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="CNR Number"
                  value={preview.cnrNumber}
                  onChange={(value) =>
                    updatePreview(
                      "cnrNumber",
                      value
                    )
                  }
                  disabled
                />

                <InputField
                  label="Case Number"
                  value={preview.caseNumber}
                  onChange={(value) =>
                    updatePreview(
                      "caseNumber",
                      value
                    )
                  }
                  required
                />

                <InputField
                  label="Case Type"
                  value={preview.caseType}
                  onChange={(value) =>
                    updatePreview(
                      "caseType",
                      value
                    )
                  }
                  required
                />

                <InputField
                  label="Case Title"
                  value={preview.title}
                  onChange={(value) =>
                    updatePreview(
                      "title",
                      value
                    )
                  }
                  required
                />

                <InputField
                  label="Court"
                  value={preview.court}
                  onChange={(value) =>
                    updatePreview(
                      "court",
                      value
                    )
                  }
                  required
                />

                <InputField
                  label="Case Stage"
                  value={preview.caseStage}
                  onChange={(value) =>
                    updatePreview(
                      "caseStage",
                      value
                    )
                  }
                />

                <SelectField
                  label="Status"
                  value={preview.status}
                  onChange={(value) =>
                    updatePreview(
                      "status",
                      value
                    )
                  }
                  options={[
                    {
                      value: "ACTIVE",
                      label: "Active",
                    },
                    {
                      value: "PENDING",
                      label: "Pending",
                    },
                    {
                      value: "CLOSED",
                      label: "Closed",
                    },
                  ]}
                />

                <SelectField
                  label="Priority"
                  value={preview.priority}
                  onChange={(value) =>
                    updatePreview(
                      "priority",
                      value
                    )
                  }
                  options={[
                    {
                      value: "LOW",
                      label: "Low",
                    },
                    {
                      value: "NORMAL",
                      label: "Normal",
                    },
                    {
                      value: "HIGH",
                      label: "High",
                    },
                    {
                      value: "URGENT",
                      label: "Urgent",
                    },
                  ]}
                />

              </div>

              {/* Court */}
              <SectionTitle title="Court Information" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <InputField
                  label="Bench"
                  value={preview.bench}
                  onChange={(value) =>
                    updatePreview(
                      "bench",
                      value
                    )
                  }
                />

                <InputField
                  label="Presiding Judge"
                  value={
                    preview.presidingJudge
                  }
                  onChange={(value) =>
                    updatePreview(
                      "presidingJudge",
                      value
                    )
                  }
                />

                <InputField
                  label="Court Room"
                  value={preview.courtRoom}
                  onChange={(value) =>
                    updatePreview(
                      "courtRoom",
                      value
                    )
                  }
                />

              </div>

              {/* Parties */}
              <SectionTitle title="Parties & Counsel" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <InputField
                  label="Opposing Party"
                  value={
                    preview.opposingParty
                  }
                  onChange={(value) =>
                    updatePreview(
                      "opposingParty",
                      value
                    )
                  }
                />

                <InputField
                  label="Opposing Counsel"
                  value={
                    preview.opposingCounsel
                  }
                  onChange={(value) =>
                    updatePreview(
                      "opposingCounsel",
                      value
                    )
                  }
                />

                <InputField
                  label="Counsel Phone"
                  value={
                    preview.counselPhone
                  }
                  onChange={(value) =>
                    updatePreview(
                      "counselPhone",
                      value
                    )
                  }
                />

              </div>

              {/* Registration */}
              <SectionTitle title="Registration Information" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <InputField
                  label="Filing Date"
                  type="date"
                  value={preview.filingDate}
                  onChange={(value) =>
                    updatePreview(
                      "filingDate",
                      value
                    )
                  }
                />

                <InputField
                  label="Registration Number"
                  value={
                    preview.registrationNumber
                  }
                  onChange={(value) =>
                    updatePreview(
                      "registrationNumber",
                      value
                    )
                  }
                />

                <InputField
                  label="Registration Date"
                  type="date"
                  value={
                    preview.registrationDate
                  }
                  onChange={(value) =>
                    updatePreview(
                      "registrationDate",
                      value
                    )
                  }
                />

              </div>

              {/* Criminal */}
              <SectionTitle title="FIR / Police Information" />

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <InputField
                  label="FIR Number"
                  value={preview.firNumber}
                  onChange={(value) =>
                    updatePreview(
                      "firNumber",
                      value
                    )
                  }
                />

                <InputField
                  label="FIR Date"
                  type="date"
                  value={preview.firDate}
                  onChange={(value) =>
                    updatePreview(
                      "firDate",
                      value
                    )
                  }
                />

                <InputField
                  label="Police Station"
                  value={
                    preview.policeStation
                  }
                  onChange={(value) =>
                    updatePreview(
                      "policeStation",
                      value
                    )
                  }
                />

                <InputField
                  label="Sections / Acts"
                  value={
                    preview.sectionsActs
                  }
                  onChange={(value) =>
                    updatePreview(
                      "sectionsActs",
                      value
                    )
                  }
                />

              </div>

              {/* Description */}
              <SectionTitle title="Case Management" />

              <div className="grid grid-cols-1 gap-5">

                <TextAreaField
                  label="Description"
                  value={preview.description}
                  onChange={(value) =>
                    updatePreview(
                      "description",
                      value
                    )
                  }
                />

                <InputField
                  label="Tags"
                  value={preview.tags}
                  onChange={(value) =>
                    updatePreview(
                      "tags",
                      value
                    )
                  }
                  placeholder="civil, property, high-priority"
                />

              </div>

              {/* Import */}
              <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="font-semibold text-green-900">
                    Ready to Import
                  </h3>

                  <p className="mt-1 text-sm text-green-700">
                    Review all information and import this
                    case into ACMS.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleImport}
                  disabled={importing}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {importing ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Import into ACMS
                    </>
                  )}
                </button>

              </div>

              {importedCaseId && (
                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-green-200 bg-green-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="text-sm text-green-800">
                    <strong>Import successful.</strong>{" "}
                    The case has been added to ACMS.
                  </div>

                  <Link
                    href={`/admin/cases/${importedCaseId}`}
                    className="flex h-10 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Case
                  </Link>

                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* Components */
/* -------------------------------------------------- */

function InfoCard({
  icon,
  title,
  text,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        {icon}
      </div>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {text}
      </p>

    </div>
  );
}

function SectionTitle({
  title,
}: {
  title: string;
}) {
  return (
    <div className="mb-5 mt-8 border-b border-slate-200 pb-2">
      <h3 className="text-base font-semibold text-slate-900">
        {title}
      </h3>
    </div>
  );
}

function DetailCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={
        wide
          ? "md:col-span-2 lg:col-span-3"
          : ""
      }
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
        {value || "—"}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
      />

    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />

    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
  }[];
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

    </div>
  );
}