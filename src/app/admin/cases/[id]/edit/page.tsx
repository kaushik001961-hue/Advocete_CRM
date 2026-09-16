"use client";

import { use, useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Scale,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  role?: string | null;
};

type CaseData = {
  id: string;
  caseNumber: string;
  title: string;
  court: string;
  status: string;
  caseType?: string | null;
  caseStage?: string | null;

  clientId: string;
  advocateId: string;

  cnrNumber?: string | null;
  eCourtsStatus?: string | null;
  eCourtsLastSyncedAt?: string | null;

  filingDate?: string | null;
  registrationNumber?: string | null;
  registrationDate?: string | null;

  opposingParty?: string | null;
  opposingCounsel?: string | null;
  counselPhone?: string | null;

  bench?: string | null;
  presidingJudge?: string | null;
  courtRoom?: string | null;

  firNumber?: string | null;
  firDate?: string | null;
  policeStation?: string | null;
  sectionsActs?: string | null;

  priority?: string | null;
  description?: string | null;
  tags?: string | null;
};

type ECourtResponse = {
  success?: boolean;
  configured?: boolean;
  demoMode?: boolean;
  message?: string;
  error?: string;

  existingCaseFound?: boolean;

  existingCase?: {
    id: string;
    caseNumber?: string | null;
    title?: string | null;
    court?: string | null;
    status?: string | null;
    caseType?: string | null;
    caseStage?: string | null;
    clientId?: string | null;
    clientName?: string | null;
    advocateId?: string | null;
    advocateName?: string | null;
    eCourtsStatus?: string | null;
    eCourtsLastSyncedAt?: string | null;
  } | null;

  case?: {
    cnrNumber?: string;
    caseNumber?: string;
    caseType?: string;
    caseStage?: string;
    title?: string;
    court?: string;
    status?: string;

    bench?: string;
    presidingJudge?: string;
    courtRoom?: string;

    opposingParty?: string;
    opposingCounsel?: string;
    counselPhone?: string;

    filingDate?: string;
    registrationNumber?: string;
    registrationDate?: string;

    firNumber?: string;
    firDate?: string;
    policeStation?: string;
    sectionsActs?: string;

    priority?: string;
    description?: string;
    tags?: string;

    eCourtsStatus?: string;
    eCourtsLastSyncedAt?: string;
  } | null;
};

export default function EditCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [caseData, setCaseData] = useState<CaseData | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [advocates, setAdvocates] = useState<Advocate[]>([]);

  const [caseNumber, setCaseNumber] = useState("");
  const [cnrNumber, setCnrNumber] = useState("");
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("");
  const [status, setStatus] = useState("PENDING");
  const [clientId, setClientId] = useState("");
  const [advocateId, setAdvocateId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchingECourt, setFetchingECourt] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [eCourtMessage, setECourtMessage] = useState("");
  const [eCourtError, setECourtError] = useState("");

  const [eCourtFetched, setECourtFetched] = useState(false);
  const [eCourtDetails, setECourtDetails] = useState<
    ECourtResponse["case"] | null
  >(null);

  /*
   * ---------------------------------------------------------
   * LOAD CASE
   * ---------------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/cases/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load case details."
          );
        }

        const loadedCase: CaseData = data?.case ?? data;

        if (cancelled) return;

        setCaseData(loadedCase);

        setCaseNumber(loadedCase.caseNumber || "");
        setCnrNumber(loadedCase.cnrNumber || "");
        setTitle(loadedCase.title || "");
        setCourt(loadedCase.court || "");
        setStatus(loadedCase.status || "PENDING");
        setClientId(loadedCase.clientId || "");
        setAdvocateId(loadedCase.advocateId || "");

        if (loadedCase.cnrNumber) {
          setECourtFetched(false);
        }
      } catch (err) {
        console.error("EDIT_CASE_LOAD_ERROR", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load case."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCase();

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
   * ---------------------------------------------------------
   * LOAD CLIENTS + ADVOCATES
   * ---------------------------------------------------------
   */
  useEffect(() => {
    async function loadOptions() {
      try {
        const [clientsResponse, advocatesResponse] =
          await Promise.all([
            fetch("/api/clients", {
              cache: "no-store",
            }),
            fetch("/api/advocates", {
              cache: "no-store",
            }),
          ]);

        const clientsData = await clientsResponse.json();
        const advocatesData = await advocatesResponse.json();

        if (clientsResponse.ok) {
          const clientList = Array.isArray(clientsData)
            ? clientsData
            : Array.isArray(clientsData?.clients)
              ? clientsData.clients
              : [];

          setClients(clientList);
        }

        if (advocatesResponse.ok) {
          const advocateList = Array.isArray(advocatesData)
            ? advocatesData
            : Array.isArray(advocatesData?.advocates)
              ? advocatesData.advocates
              : [];

          setAdvocates(advocateList);
        }
      } catch (err) {
        console.error(
          "Failed to load clients/advocates:",
          err
        );
      }
    }

    loadOptions();
  }, []);

  /*
   * ---------------------------------------------------------
   * FETCH eCOURT DETAILS
   * ---------------------------------------------------------
   */
  async function handleFetchECourtDetails() {
    const cnr = cnrNumber.trim().toUpperCase();

    setError("");
    setSuccess("");
    setECourtError("");
    setECourtMessage("");
    setECourtDetails(null);
    setECourtFetched(false);

    if (!cnr) {
      setECourtError("Please enter a CNR number.");
      return;
    }

    if (!/^[A-Z0-9]{16}$/.test(cnr)) {
      setECourtError(
        "CNR number must contain exactly 16 letters/numbers."
      );
      return;
    }

    setFetchingECourt(true);

    try {
      const response = await fetch("/api/ecourts/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cnrNumber: cnr,
        }),
      });

      const data: ECourtResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to fetch eCourt details."
        );
      }

      /*
       * Existing case found
       */
      if (
        data.existingCaseFound &&
        data.existingCase
      ) {
        setECourtError(
          "This CNR number is already linked to another ACMS case."
        );

        setECourtMessage(
          data.message ||
            "This CNR number is already imported into ACMS."
        );

        return;
      }

      const fetchedCase = data.case;

      if (!fetchedCase) {
        throw new Error(
          "No eCourt case details were returned."
        );
      }

      setECourtDetails(fetchedCase);
      setECourtFetched(true);

      /*
       * Keep the entered CNR.
       */
      setCnrNumber(
        fetchedCase.cnrNumber || cnr
      );

      /*
       * Populate available case information.
       *
       * We intentionally only update fields that are
       * available from eCourts.
       */
      if (fetchedCase.caseNumber) {
        setCaseNumber(fetchedCase.caseNumber);
      }

      if (fetchedCase.title) {
        setTitle(fetchedCase.title);
      }

      if (fetchedCase.court) {
        setCourt(fetchedCase.court);
      }

      if (fetchedCase.status) {
        setStatus(fetchedCase.status);
      }

      setECourtMessage(
        data.message ||
          "eCourt details fetched successfully."
      );
    } catch (err) {
      console.error(
        "FETCH_ECOURT_DETAILS_ERROR",
        err
      );

      setECourtError(
        err instanceof Error
          ? err.message
          : "Unable to fetch eCourt details."
      );
    } finally {
      setFetchingECourt(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * UPDATE CASE
   * ---------------------------------------------------------
   */
  async function handleUpdateCase(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!caseNumber.trim()) {
      setError("Case number is required.");
      return;
    }

    if (!title.trim()) {
      setError("Case title is required.");
      return;
    }

    if (!court.trim()) {
      setError("Court is required.");
      return;
    }

    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    if (!advocateId) {
      setError("Please select an advocate.");
      return;
    }

    if (cnrNumber && !/^[A-Z0-9]{16}$/.test(cnrNumber)) {
      setError(
        "CNR number must contain exactly 16 letters/numbers."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/cases/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseNumber: caseNumber.trim(),
          cnrNumber: cnrNumber
            ? cnrNumber.trim().toUpperCase()
            : null,
          title: title.trim(),
          court: court.trim(),
          status,
          clientId,
          advocateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to update case."
        );
      }

      setSuccess("Case updated successfully.");

      /*
       * Give the success message a moment to display,
       * then return to the case details page.
       */
      setTimeout(() => {
        router.push(`/admin/cases/${id}`);
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("UPDATE_CASE_ERROR", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to update case."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Loading case details...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * ERROR / CASE NOT FOUND
   * ---------------------------------------------------------
   */
  if (!caseData) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />

            <div>
              <h2 className="font-semibold text-red-800">
                Unable to load case
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error || "Case was not found."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN UI
   * ---------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() =>
              router.push(`/admin/cases/${id}`)
            }
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Case
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Scale className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Case
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Update case information and eCourts
                integration details.
              </p>
            </div>
          </div>
        </div>

        {/* Global Error */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Global Success */}
        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />

              <p className="text-sm font-medium text-green-700">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleUpdateCase}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          {/* Case Number */}
          <div className="mb-5">
            <label
              htmlFor="caseNumber"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Case Number
            </label>

            <input
              id="caseNumber"
              type="text"
              value={caseNumber}
              onChange={(event) =>
                setCaseNumber(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* eCourts Integration */}
          <div
            id="cnrNumber"
            className="mb-6 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Scale className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-gray-900">
                  eCourts Integration
                </h2>

                <p className="mt-0.5 text-xs text-gray-500">
                  Add the CNR number to enable eCourts
                  tracking.
                </p>
              </div>
            </div>

            <label
              htmlFor="cnr"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              CNR Number
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <input
                  id="cnr"
                  type="text"
                  value={cnrNumber}
                  maxLength={16}
                  onChange={(event) => {
                    const value = event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");

                    setCnrNumber(value);

                    setECourtError("");
                    setECourtMessage("");
                    setECourtFetched(false);
                    setECourtDetails(null);
                  }}
                  placeholder="EXAMPLE: MHAU019999992015"
                  className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm uppercase tracking-wide text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <span className="absolute bottom-[-20px] right-1 text-xs text-gray-400">
                  {cnrNumber.length}/16
                </span>
              </div>

              {/* Fetch eCourt Details */}
              <button
                type="button"
                onClick={handleFetchECourtDetails}
                disabled={
                  fetchingECourt ||
                  cnrNumber.length !== 16
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fetchingECourt ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    Fetch eCourt Details
                  </>
                )}
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Enter exactly 16 letters/numbers.
            </p>

            {/* CNR Valid */}
            {cnrNumber.length === 16 && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />

                <span className="text-xs font-medium text-green-700">
                  Valid 16-character CNR format
                </span>
              </div>
            )}

            {/* eCourt Error */}
            {eCourtError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                  <div>
                    <p className="text-sm font-medium text-red-700">
                      {eCourtError}
                    </p>

                    {eCourtMessage && (
                      <p className="mt-1 text-xs text-red-600">
                        {eCourtMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* eCourt Success */}
            {eCourtFetched && eCourtDetails && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-green-800">
                      eCourt Details Fetched
                    </p>

                    <p className="mt-1 text-xs text-green-700">
                      The available eCourt information has
                      been loaded into this case form. Review
                      the information and click Update Case
                      at the bottom.
                    </p>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {eCourtDetails.caseNumber && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Case Number
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.caseNumber}
                          </p>
                        </div>
                      )}

                      {eCourtDetails.caseType && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Case Type
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.caseType}
                          </p>
                        </div>
                      )}

                      {eCourtDetails.court && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Court
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.court}
                          </p>
                        </div>
                      )}

                      {eCourtDetails.caseStage && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Case Stage
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.caseStage}
                          </p>
                        </div>
                      )}

                      {eCourtDetails.bench && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Bench
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.bench}
                          </p>
                        </div>
                      )}

                      {eCourtDetails.presidingJudge && (
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-green-600">
                            Presiding Judge
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-900">
                            {eCourtDetails.presidingJudge}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* eCourt Message */}
            {!eCourtError &&
              eCourtMessage &&
              !eCourtFetched && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-700">
                    {eCourtMessage}
                  </p>
                </div>
              )}
          </div>

          {/* Case Title */}
          <div className="mb-5">
            <label
              htmlFor="title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Case Title
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Court */}
          <div className="mb-5">
            <label
              htmlFor="court"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Court
            </label>

            <input
              id="court"
              type="text"
              value={court}
              onChange={(event) =>
                setCourt(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status */}
          <div className="mb-5">
            <label
              htmlFor="status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PENDING">PENDING</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Client */}
          <div className="mb-5">
            <label
              htmlFor="client"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Client
            </label>

            <select
              id="client"
              value={clientId}
              onChange={(event) =>
                setClientId(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select Client
              </option>

              {clients.map((client) => (
                <option
                  key={client.id}
                  value={client.id}
                >
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Advocate */}
          <div className="mb-8">
            <label
              htmlFor="advocate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Advocate
            </label>

            <select
              id="advocate"
              value={advocateId}
              onChange={(event) =>
                setAdvocateId(event.target.value)
              }
              className="h-12 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select Advocate
              </option>

              {advocates.map((advocate) => (
                <option
                  key={advocate.id}
                  value={advocate.id}
                >
                  {advocate.name}
                  {advocate.email
                    ? ` — ${advocate.email}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() =>
                router.push(`/admin/cases/${id}`)
              }
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {/* UPDATE CASE AT BOTTOM */}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Update Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}