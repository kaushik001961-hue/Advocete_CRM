"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  PlusCircle,
  Search,
  FileText,
  Calendar,
  X,
  Edit3,
  Save,
  CheckCircle2,
  Share2,
  FileDown,
} from "lucide-react";
import { generateAndSharePDF } from "@/utils/shareUtils";

interface Client {
  id: string;
  name: string;
}

interface CaseDocument {
  id: string;
  name: string;
  fileUrl: string;
}

interface HearingItem {
  id: string;
  date: string;
  remarks?: string;
  status: string;
}

interface CaseItem {
  id: string;
  caseNumber: string;
  caseType: string;
  title: string;
  court: string;
  status: string;
  opposingCounsel?: string;
  counselPhone?: string;
  client?: Client;
  clientId?: string;
  documents: CaseDocument[];
  hearings: HearingItem[];
}

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

function getCaseTypeLabel(caseType?: string) {
  if (!caseType) return "Not specified";

  const found = CASE_TYPES.find((item) => item.value === caseType);

  return found?.label || caseType;
}

export default function AdvocateCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [shareStatus, setShareStatus] = useState("");

  const [editTitle, setEditTitle] = useState("");
  const [editCaseType, setEditCaseType] = useState("");
  const [editCourt, setEditCourt] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCounsel, setEditCounsel] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editClientId, setEditClientId] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [caseNumber, setCaseNumber] = useState("");
  const [caseType, setCaseType] = useState("");
  const [title, setTitle] = useState("");
  const [court, setCourt] = useState("");
  const [clientId, setClientId] = useState("");
  const [opposingCounsel, setOpposingCounsel] = useState("");
  const [counselPhone, setCounselPhone] = useState("");

  /*
   * Data loading is intentionally kept inside the effect.
   * This avoids React's set-state-in-effect warning caused by
   * calling functions that synchronously trigger state updates.
   */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [casesResponse, clientsResponse] = await Promise.all([
          fetch("/api/cases"),
          fetch("/api/clients"),
        ]);

        const casesData = await casesResponse.json();
        const clientsData = await clientsResponse.json();

        if (cancelled) return;

        if (Array.isArray(casesData)) {
          setCases(casesData);
        }

        if (Array.isArray(clientsData)) {
          setClients(clientsData);

          if (clientsData.length > 0) {
            setClientId((currentClientId) =>
              currentClientId || clientsData[0].id
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load cases and clients", err);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshCases = async () => {
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();

      if (Array.isArray(data)) {
        setCases(data);
      }
    } catch (err) {
      console.error("Failed to refresh cases", err);
    }
  };

  const handleOpenManageModal = (c: CaseItem) => {
    setSelectedCase(c);
    setIsEditing(false);
    setSuccessMessage("");
    setShareStatus("");

    setEditTitle(c.title);
    setEditCaseType(c.caseType || "");
    setEditCourt(c.court);
    setEditStatus(c.status);
    setEditCounsel(c.opposingCounsel || "");
    setEditPhone(c.counselPhone || "");
    setEditClientId(c.client?.id || c.clientId || "");
  };

  const handleSharePDF = async () => {
    if (!selectedCase) return;

    setShareStatus("Opening Print / Save PDF dialog...");

    await generateAndSharePDF(
      "printable-case-card",
      selectedCase.title
    );

    setShareStatus("Ready!");

    setTimeout(() => {
      setShareStatus("");
    }, 2000);
  };

  const handleUpdateCase = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedCase) return;

    try {
      const res = await fetch(`/api/cases/${selectedCase.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editTitle,
          caseType: editCaseType,
          court: editCourt,
          status: editStatus,
          opposingCounsel: editCounsel,
          counselPhone: editPhone,
          clientId: editClientId,
        }),
      });

      if (res.ok) {
        const updated = await res.json();

        setSelectedCase(updated);
        setIsEditing(false);
        setSuccessMessage("Case edited successfully!");

        await refreshCases();

        setTimeout(() => {
          setSuccessMessage("");
        }, 3000);
      } else {
        const errorData = await res.json().catch(() => null);

        console.error(
          "Failed to update case",
          errorData || res.statusText
        );
      }
    } catch (err) {
      console.error("Failed to update case", err);
    }
  };

  const handleCreateCase = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !caseNumber ||
      !caseType ||
      !title ||
      !court ||
      !clientId
    ) {
      return;
    }

    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseNumber,
          caseType,
          title,
          court,
          opposingCounsel,
          counselPhone,
          clientId,
        }),
      });

      if (res.ok) {
        const createdCase = await res.json();

        setCases((currentCases) => [
          createdCase,
          ...currentCases,
        ]);

        setIsModalOpen(false);

        setCaseNumber("");
        setCaseType("");
        setTitle("");
        setCourt("");
        setOpposingCounsel("");
        setCounselPhone("");
      } else {
        const errorData = await res.json().catch(() => null);

        console.error(
          "Failed to create case",
          errorData || res.statusText
        );
      }
    } catch (err) {
      console.error("Failed to create case", err);
    }
  };

  const filteredCases = cases.filter((c) => {
    const search = searchTerm.toLowerCase();

    return (
      c.caseNumber.toLowerCase().includes(search) ||
      c.title.toLowerCase().includes(search) ||
      c.court.toLowerCase().includes(search) ||
      getCaseTypeLabel(c.caseType)
        .toLowerCase()
        .includes(search) ||
      (c.client?.name &&
        c.client.name.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Briefcase size={20} />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Litigation & Case Files
            </h1>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Manage active case portfolios, track case types,
            opposing counsel details, and link cases to clients.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          <PlusCircle size={16} />
          Add New Case
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Search by case number, type, title, client, or court..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4">Case Number</th>
                <th className="py-3 px-4">Case Type</th>
                <th className="py-3 px-4">Case Title</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Court</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-gray-400"
                  >
                    Loading cases...
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-gray-400"
                  >
                    No active cases recorded.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-blue-50/40 transition cursor-pointer"
                    onClick={() => {
                      window.location.href = `/advocate/cases/${c.id}`;
                    }}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <Link
                        href={`/advocate/cases/${c.id}`}
                        className="hover:underline hover:text-blue-800 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.caseNumber}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {getCaseTypeLabel(c.caseType)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <Link
                        href={`/advocate/cases/${c.id}`}
                        className="hover:text-blue-600 hover:underline transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.title}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 text-gray-800 font-medium">
                      {c.client?.name || "Unassigned"}
                    </td>

                    <td className="py-3.5 px-4 text-gray-600">
                      {c.court}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/advocate/cases/${c.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                        >
                          Open Case
                        </Link>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenManageModal(c);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition cursor-pointer"
                        >
                          Manage Case
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Management Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {isEditing
                    ? "Edit Case File"
                    : selectedCase.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <p className="text-[11px] font-mono text-blue-600">
                    {selectedCase.caseNumber}
                  </p>

                  {selectedCase.caseType && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-bold">
                      {getCaseTypeLabel(selectedCase.caseType)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button
                    onClick={handleSharePDF}
                    title="Export & Save PDF"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    <FileDown size={14} />
                    Export PDF
                  </button>
                )}

                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setSuccessMessage("");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    <Edit3 size={14} />
                    Edit Details
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-semibold rounded-xl text-xs transition cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}

                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {shareStatus && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs font-semibold animate-fadeIn">
                <Share2
                  size={16}
                  className="text-blue-600"
                />
                <span>{shareStatus}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-semibold animate-fadeIn">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600"
                />
                <span>{successMessage}</span>
              </div>
            )}

            <div
              id="printable-case-card"
              className="bg-white p-2 space-y-4"
            >
              {!isEditing ? (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                        Assigned Client
                      </span>

                      <p className="font-bold text-gray-900">
                        {selectedCase.client?.name ||
                          "Unassigned"}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 space-y-1">
                      <span className="text-blue-500 block text-[10px] uppercase font-semibold">
                        Case Type
                      </span>

                      <p className="font-bold text-blue-700">
                        {getCaseTypeLabel(
                          selectedCase.caseType
                        )}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                        Court / Bench
                      </span>

                      <p className="font-bold text-gray-900">
                        {selectedCase.court}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                        Status
                      </span>

                      <p className="font-bold text-emerald-600">
                        {selectedCase.status}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Opposing Counsel
                    </span>

                    <p className="font-bold text-gray-900">
                      {selectedCase.opposingCounsel ||
                        "Not specified"}
                    </p>

                    <p className="text-gray-500 text-[11px]">
                      {selectedCase.counselPhone ||
                        "No phone available"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <FileText
                        size={14}
                        className="text-blue-600"
                      />
                      Case Documents (
                      {selectedCase.documents.length})
                    </h3>

                    {selectedCase.documents.length === 0 ? (
                      <p className="text-gray-400 italic bg-gray-50 p-3 rounded-xl">
                        No documents uploaded.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedCase.documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <span className="font-medium text-gray-800">
                              {doc.name}
                            </span>

                            <span className="text-blue-600 font-semibold">
                              {doc.fileUrl}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-900 flex items-center gap-1.5">
                      <Calendar
                        size={14}
                        className="text-blue-600"
                      />
                      Upcoming Hearings (
                      {selectedCase.hearings.length})
                    </h3>

                    {selectedCase.hearings.length === 0 ? (
                      <p className="text-gray-400 italic bg-gray-50 p-3 rounded-xl">
                        No hearings scheduled.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {selectedCase.hearings.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                          >
                            <div>
                              <p className="font-bold text-gray-900">
                                {new Date(
                                  h.date
                                ).toLocaleDateString()}
                              </p>

                              <p className="text-gray-500 text-[11px]">
                                {h.remarks || "No remarks"}
                              </p>
                            </div>

                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold text-[10px] rounded-full">
                              {h.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleUpdateCase}
                  className="space-y-4 text-xs"
                >
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Case Title
                    </label>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) =>
                        setEditTitle(e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Case Type
                      </label>

                      <select
                        value={editCaseType}
                        onChange={(e) =>
                          setEditCaseType(e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="">
                          -- Select Case Type --
                        </option>

                        {CASE_TYPES.map((type) => (
                          <option
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Court Name
                      </label>

                      <input
                        type="text"
                        value={editCourt}
                        onChange={(e) =>
                          setEditCourt(e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Status
                    </label>

                    <select
                      value={editStatus}
                      onChange={(e) =>
                        setEditStatus(e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="PENDING">PENDING</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Assigned Client
                    </label>

                    <select
                      value={editClientId}
                      onChange={(e) =>
                        setEditClientId(e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">
                        -- Choose a Client --
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Opposing Counsel
                      </label>

                      <input
                        type="text"
                        value={editCounsel}
                        onChange={(e) =>
                          setEditCounsel(e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Counsel Phone
                      </label>

                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) =>
                          setEditPhone(e.target.value)
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm cursor-pointer"
                    >
                      <Save size={14} />
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!isEditing && (
              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Briefcase
                  size={16}
                  className="text-blue-600"
                />
                Add New Case File
              </h2>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateCase}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Select Client
                </label>

                <select
                  value={clientId}
                  onChange={(e) =>
                    setClientId(e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                >
                  <option value="">
                    -- Choose a Client --
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

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Case Number
                </label>

                <input
                  type="text"
                  placeholder="e.g. CS/402/2025"
                  value={caseNumber}
                  onChange={(e) =>
                    setCaseNumber(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Case Type
                </label>

                <select
                  value={caseType}
                  onChange={(e) =>
                    setCaseType(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">
                    -- Select Case Type --
                  </option>

                  {CASE_TYPES.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Case Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. M/s. Apex Corp vs State"
                  value={title}
                  onChange={(e) =>
                    setTitle(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Court Name / Bench
                </label>

                <input
                  type="text"
                  placeholder="e.g. High Court of Delhi"
                  value={court}
                  onChange={(e) =>
                    setCourt(e.target.value)
                  }
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Opposing Counsel
                  </label>

                  <input
                    type="text"
                    placeholder="Counsel Name"
                    value={opposingCounsel}
                    onChange={(e) =>
                      setOpposingCounsel(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Counsel Phone
                  </label>

                  <input
                    type="text"
                    placeholder="Phone number"
                    value={counselPhone}
                    onChange={(e) =>
                      setCounselPhone(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm cursor-pointer"
                >
                  Save Case File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}