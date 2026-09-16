"use client";

import { use, useEffect, useState } from "react";
import CaseTimeline from "@/components/cases/CaseTimeline";
import { useRouter } from "next/navigation";
import CaseImportantDates from "@/components/cases/CaseImportantDates";
import CaseNotes from "@/components/cases/CaseNotes";
import RelatedCases from "@/components/cases/RelatedCases";
import CaseDocuments from "@/components/cases/CaseDocuments";
import {
  ArrowLeft,
  Calendar,
  User,
  Briefcase,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit,
  MapPin,
  Scale,
  Building2,
  Gavel,
  Phone,
  Users,
  FolderOpen,
  ExternalLink,
  Loader2,
} from "lucide-react";

const CASE_TYPES = [
  { value: "CIVIL", label: "Civil" },
  { value: "CRIMINAL", label: "Criminal" },
  { value: "FAMILY", label: "Family / Matrimonial" },
  { value: "CONSTITUTIONAL", label: "Constitutional" },
  { value: "CORPORATE", label: "Corporate / Commercial" },
  { value: "CONSUMER", label: "Consumer" },
  { value: "LABOUR", label: "Labour / Employment" },
  { value: "PROPERTY", label: "Property" },
  { value: "MOTOR_ACCIDENT", label: "Motor Accident" },
  { value: "CHEQUE_BOUNCE", label: "Cheque Bounce / NI Act" },
  { value: "TAX", label: "Tax" },
  { value: "SERVICE", label: "Service" },
  { value: "ARBITRATION", label: "Arbitration" },
  {
    value: "INTELLECTUAL_PROPERTY",
    label: "Intellectual Property",
  },
  { value: "CYBER_CRIME", label: "Cyber Crime" },
  { value: "WRIT", label: "Writ Petition" },
  { value: "BAIL", label: "Bail" },
  { value: "APPEAL", label: "Appeal" },
  { value: "REVISION", label: "Revision" },
  { value: "OTHER", label: "Other" },
];

function getCaseTypeLabel(caseType?: string | null) {
  if (!caseType) return "Not specified";

  const found = CASE_TYPES.find((type) => type.value === caseType);

  return found?.label || caseType;
}

function formatDate(
  value?: string | Date | null,
  includeTime = false
): string {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not specified";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

function getStatusClasses(status?: string | null) {
  const value = String(status || "").toUpperCase();

  if (
    value === "COMPLETED" ||
    value === "CLOSED" ||
    value === "RESOLVED"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "ADJOURNED" || value === "ON_HOLD") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "CANCELLED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

function getHearingStatusClasses(status?: string | null) {
  const value = String(status || "").toUpperCase();

  if (value === "COMPLETED") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (value === "ADJOURNED") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (value === "CANCELLED") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  return "bg-blue-600 text-white border-blue-600";
}

function getPriorityClasses(priority?: string | null) {
  const value = String(priority || "").toUpperCase();

  if (value === "HIGH" || value === "URGENT") {
    return "bg-red-50 text-red-700 border-red-200";
  }

  if (value === "LOW") {
    return "bg-gray-50 text-gray-600 border-gray-200";
  }

  return "bg-blue-50 text-blue-700 border-blue-200";
}

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
};

type Hearing = {
  id: string;
  date: string | Date;
  remarks?: string | null;
  nextDate?: string | Date | null;
  status: string;
  courtRoom?: string | null;
  hearingType?: string | null;
  orderPassed?: string | null;
};

type DocumentItem = {
  id: string;
  title?: string | null;
  name?: string | null;
  fileName?: string | null;
  category?: string | null;
  url?: string | null;
  createdAt?: string | Date | null;
};

type TimelineEvent = {
  id: string;
  eventType: string;
  title: string;
  description?: string | null;
  eventDate: string | Date;
  createdAt?: string | Date | null;
};

type ImportantDate = {
  id: string;
  title: string;
  date: string | Date;
  description?: string | null;
};

type CaseNote = {
  id: string;
  title?: string | null;
  content: string;
  createdAt?: string | Date | null;
};

type RelatedCase = {
  id: string;
  title?: string | null;
  caseNumber?: string | null;
  status?: string | null;
  relationType?: string | null;
};

type CaseRelationItem = {
  id: string;
  relationType: string;
  relatedCase?: RelatedCase | null;
};

type CaseDetails = {
  id: string;
  title: string;
  caseNumber: string;
  caseType?: string | null;
  court: string;
  status: string;
  caseStage?: string | null;
  description?: string | null;

  filingDate?: string | Date | null;
  registrationNumber?: string | null;
  registrationDate?: string | Date | null;

  priority?: string | null;

  opposingParty?: string | null;
  opposingCounsel?: string | null;
  counselPhone?: string | null;

  bench?: string | null;
  presidingJudge?: string | null;
  courtRoom?: string | null;

  firNumber?: string | null;
  firDate?: string | Date | null;
  policeStation?: string | null;
  sectionsActs?: string | null;

  tags?: string | null;

  client?: Client | null;
  advocate?: Advocate | null;

  hearings?: Hearing[];
  documents?: DocumentItem[];
  timelineEvents?: TimelineEvent[];
  importantDates?: ImportantDate[];
  notes?: CaseNote[];

  relatedFrom?: CaseRelationItem[];
  relatedTo?: CaseRelationItem[];
};

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <div className="mt-0.5 shrink-0 text-gray-400">{icon}</div>

      <div className="min-w-0">
        <p className="text-[11px] font-medium text-gray-400">
          {label}
        </p>

        <p className="mt-0.5 break-words text-xs font-semibold text-gray-900">
          {value || "Not specified"}
        </p>
      </div>
    </div>
  );
}

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const caseId = resolvedParams.id;

  const [caseDetails, setCaseDetails] =
    useState<CaseDetails | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCase() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/cases/${caseId}`, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load case."
          );
        }

        if (!cancelled) {
          setCaseDetails(data.case ?? data);
        }
      } catch (err) {
        console.error("Case detail load error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load case details."
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
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

          <p className="text-sm text-gray-500">
            Loading case details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !caseDetails) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <button
          onClick={() => router.push("/advocate/cases")}
          className="mb-6 flex items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Cases
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />

          <h1 className="mt-3 text-lg font-bold text-red-800">
            Unable to Load Case
          </h1>

          <p className="mt-2 text-sm text-red-600">
            {error ||
              "The requested case could not be found."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hearings = caseDetails.hearings ?? [];
  const documents = caseDetails.documents ?? [];
  const timelineEvents = caseDetails.timelineEvents ?? [];
  const importantDates = caseDetails.importantDates ?? [];
  const notes = caseDetails.notes ?? [];

  const allRelatedCases = [
    ...(caseDetails.relatedFrom ?? []),
    ...(caseDetails.relatedTo ?? []),
  ];

  /*
   * Do not use Date.now() here.
   *
   * React's purity rule treats Date.now() during render
   * as an impure function. We therefore determine the next
   * scheduled hearing by status and chronological order.
   */
  const nextHearing = [...hearings]
    .filter(
      (hearing) =>
        hearing.status.toUpperCase() === "SCHEDULED"
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )[0];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
      {/* Back / Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => router.push("/advocate/cases")}
          className="flex w-fit items-center gap-2 text-xs font-semibold text-gray-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Cases
        </button>

        <button
          onClick={() =>
            router.push(
              `/advocate/cases?edit=${caseDetails.id}`
            )
          }
          className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Edit size={14} />
          Edit Case
        </button>
      </div>

      {/* Main Case Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700">
                  {caseDetails.caseNumber ||
                    "No Case Number"}
                </span>

                <span className="rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {getCaseTypeLabel(
                    caseDetails.caseType
                  )}
                </span>

                {caseDetails.priority && (
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getPriorityClasses(
                      caseDetails.priority
                    )}`}
                  >
                    {caseDetails.priority}
                  </span>
                )}
              </div>

              <h1 className="mt-3 break-words text-xl font-bold text-gray-900 md:text-2xl">
                {caseDetails.title}
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Litigation File Overview
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                  caseDetails.status
                )}`}
              >
                {caseDetails.status}
              </span>

              {caseDetails.caseStage && (
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700">
                  {caseDetails.caseStage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 border-t border-gray-100 md:grid-cols-4">
          <div className="border-r border-gray-100 p-4">
            <p className="text-[11px] text-gray-400">
              Hearings
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {hearings.length}
            </p>
          </div>

          <div className="border-r border-gray-100 p-4">
            <p className="text-[11px] text-gray-400">
              Documents
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {documents.length}
            </p>
          </div>

          <div className="border-r border-gray-100 p-4">
            <p className="text-[11px] text-gray-400">
              Important Dates
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {importantDates.length}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[11px] text-gray-400">
              Notes
            </p>

            <p className="mt-1 text-lg font-bold text-gray-900">
              {notes.length}
            </p>
          </div>
        </div>
      </div>

      {/* Case Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Scale size={17} className="text-blue-600" />

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Case Information
            </h2>

            <p className="text-[11px] text-gray-400">
              Core details of the litigation matter
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            icon={<User size={16} />}
            label="Client"
            value={caseDetails.client?.name}
          />

          <InfoItem
            icon={<Briefcase size={16} />}
            label="Case Type"
            value={getCaseTypeLabel(
              caseDetails.caseType
            )}
          />

          <InfoItem
            icon={<Building2 size={16} />}
            label="Court / Forum"
            value={caseDetails.court}
          />

          <InfoItem
            icon={<Calendar size={16} />}
            label="Filing Date"
            value={formatDate(caseDetails.filingDate)}
          />

          <InfoItem
            icon={<FileText size={16} />}
            label="Registration Number"
            value={caseDetails.registrationNumber}
          />

          <InfoItem
            icon={<Calendar size={16} />}
            label="Registration Date"
            value={formatDate(
              caseDetails.registrationDate
            )}
          />

          <InfoItem
            icon={<Gavel size={16} />}
            label="Presiding Judge"
            value={caseDetails.presidingJudge}
          />

          <InfoItem
            icon={<Users size={16} />}
            label="Bench"
            value={caseDetails.bench}
          />

          <InfoItem
            icon={<MapPin size={16} />}
            label="Court Room"
            value={caseDetails.courtRoom}
          />
        </div>
      </div>

      {/* Client & Opposing Party */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Client */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
            <User size={17} className="text-blue-600" />

            <h2 className="text-sm font-bold text-gray-900">
              Client Information
            </h2>
          </div>

          <div className="space-y-3">
            <InfoItem
              icon={<User size={16} />}
              label="Name"
              value={caseDetails.client?.name}
            />

            <InfoItem
              icon={<Phone size={16} />}
              label="Phone"
              value={caseDetails.client?.phone}
            />

            <InfoItem
              icon={<FileText size={16} />}
              label="Email"
              value={caseDetails.client?.email}
            />
          </div>
        </div>

        {/* Opposing Party */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
            <Users size={17} className="text-indigo-600" />

            <h2 className="text-sm font-bold text-gray-900">
              Opposing Party
            </h2>
          </div>

          <div className="space-y-3">
            <InfoItem
              icon={<User size={16} />}
              label="Opposing Party"
              value={caseDetails.opposingParty}
            />

            <InfoItem
              icon={<Scale size={16} />}
              label="Opposing Counsel"
              value={caseDetails.opposingCounsel}
            />

            <InfoItem
              icon={<Phone size={16} />}
              label="Counsel Phone"
              value={caseDetails.counselPhone}
            />
          </div>
        </div>
      </div>

      {/* Criminal / FIR Information */}
      {(caseDetails.firNumber ||
        caseDetails.firDate ||
        caseDetails.policeStation ||
        caseDetails.sectionsActs) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
            <AlertCircle
              size={17}
              className="text-red-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                FIR / Criminal Case Information
              </h2>

              <p className="text-[11px] text-gray-400">
                Police and statutory information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={<FileText size={16} />}
              label="FIR Number"
              value={caseDetails.firNumber}
            />

            <InfoItem
              icon={<Calendar size={16} />}
              label="FIR Date"
              value={formatDate(caseDetails.firDate)}
            />

            <InfoItem
              icon={<Building2 size={16} />}
              label="Police Station"
              value={caseDetails.policeStation}
            />

            <InfoItem
              icon={<Scale size={16} />}
              label="Sections / Acts"
              value={caseDetails.sectionsActs}
            />
          </div>
        </div>
      )}

      {/* Case Summary */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2 border-b border-gray-100 pb-4">
          <FileText
            size={17}
            className="text-blue-600"
          />

          <div>
            <h2 className="text-sm font-bold text-gray-900">
              Case Summary & Brief
            </h2>

            <p className="text-[11px] text-gray-400">
              Matter description and case overview
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <p className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
            {caseDetails.description ||
              "No case description available."}
          </p>
        </div>

        {caseDetails.tags && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold text-gray-400">
              Tags
            </p>

            <div className="flex flex-wrap gap-2">
              {caseDetails.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Hearing */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-600 p-2.5 text-white">
              <Calendar size={18} />
            </div>

            <div>
              <p className="text-[11px] font-medium text-blue-600">
                NEXT HEARING
              </p>

              {nextHearing ? (
                <>
                  <p className="mt-1 text-base font-bold text-gray-900">
                    {formatDate(
                      nextHearing.date,
                      true
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-gray-600">
                    {nextHearing.hearingType ||
                      nextHearing.remarks ||
                      "Scheduled hearing"}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm font-semibold text-gray-700">
                  No upcoming scheduled hearing
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/advocate/hearings")
            }
            className="flex w-fit items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
          >
            View Hearings
            <ExternalLink size={13} />
          </button>
        </div>
      </div>

      {/* Hearings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Calendar
              size={17}
              className="text-blue-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Hearing Schedule & History
              </h2>

              <p className="text-[11px] text-gray-400">
                Chronological record of court appearances
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/advocate/hearings")
            }
            className="flex w-fit items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <Calendar size={14} />
            Manage Hearings
          </button>
        </div>

        {hearings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-gray-300" />

            <p className="mt-2 text-sm font-semibold text-gray-600">
              No hearings recorded
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Hearing records for this case will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...hearings]
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() -
                  new Date(a.date).getTime()
              )
              .map((hearing) => (
                <div
                  key={hearing.id}
                  className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-200 hover:bg-gray-50/50"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                          <Calendar
                            size={14}
                            className="text-blue-500"
                          />

                          {formatDate(
                            hearing.date,
                            true
                          )}
                        </span>

                        {hearing.hearingType && (
                          <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                            {hearing.hearingType}
                          </span>
                        )}
                      </div>

                      {hearing.remarks && (
                        <p className="mt-3 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                          <strong className="font-semibold text-gray-700">
                            Remarks:
                          </strong>{" "}
                          {hearing.remarks}
                        </p>
                      )}

                      {hearing.orderPassed && (
                        <p className="mt-2 rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-xs leading-5 text-gray-600">
                          <strong className="font-semibold text-blue-700">
                            Order Passed:
                          </strong>{" "}
                          {hearing.orderPassed}
                        </p>
                      )}

                      {hearing.nextDate && (
                        <p className="mt-2 text-[11px] text-gray-400">
                          Next Date:{" "}
                          <strong className="text-gray-600">
                            {formatDate(
                              hearing.nextDate
                            )}
                          </strong>
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-end">
                      {hearing.courtRoom && (
                        <span className="rounded-md bg-gray-100 px-2.5 py-1 text-[10px] font-medium text-gray-600">
                          {hearing.courtRoom}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${getHearingStatusClasses(
                          hearing.status
                        )}`}
                      >
                        {hearing.status.toUpperCase() ===
                          "COMPLETED" && (
                          <CheckCircle2 size={12} />
                        )}

                        {hearing.status.toUpperCase() ===
                          "SCHEDULED" && (
                          <Clock size={12} />
                        )}

                        {hearing.status.toUpperCase() ===
                          "ADJOURNED" && (
                          <AlertCircle size={12} />
                        )}

                        {hearing.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen
              size={17}
              className="text-indigo-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Case Documents
              </h2>

              <p className="text-[11px] text-gray-400">
                Documents attached to this case
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              router.push("/advocate/documents")
            }
            className="flex w-fit items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            Manage Documents
            <ExternalLink size={13} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-gray-300" />

            <p className="mt-2 text-sm font-semibold text-gray-600">
              No documents attached
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-3 transition hover:border-indigo-200 hover:bg-gray-50"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                    <FileText size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900">
                      {document.title ||
                        document.name ||
                        document.fileName ||
                        "Untitled Document"}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {document.category ||
                        "Document"}
                    </p>
                  </div>
                </div>

                {document.url && (
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                    aria-label="Open document"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Case Activity */}

      <CaseDocuments
  caseId={caseDetails.id}
 clientId={caseDetails.client?.id}
/>
      <CaseTimeline caseId={caseDetails.id} />
      <CaseImportantDates caseId={caseDetails.id} />
      <CaseNotes caseId={caseDetails.id} />
      <RelatedCases caseId={caseDetails.id} />

      {/* Bottom Actions */}
      <div className="flex flex-col gap-3 border-t border-gray-200 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() =>
            router.push("/advocate/cases")
          }
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={14} />
          Back to Cases
        </button>

        <button
          onClick={() =>
            router.push(
              `/advocate/cases?edit=${caseDetails.id}`
            )
          }
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          <Edit size={14} />
          Edit Case
        </button>
      </div>
    </div>
  );
}