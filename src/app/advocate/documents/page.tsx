"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Download,
  Trash2,
  Lock,
  FolderOpen,
  X,
  ChevronDown,
} from "lucide-react";

type DocumentCategory =
  | "Case Filing"
  | "Evidence & Supporting Documents"
  | "Court Documents"
  | "Case Administration"
  | "Correspondence"
  | "Agreements & Contracts"
  | "Client Documents"
  | "Financial"
  | "Other";

interface DocumentSubcategory {
  value: string;
  label: string;
}

interface DocumentCategoryGroup {
  value: DocumentCategory;
  label: string;
  items: DocumentSubcategory[];
}

interface DocumentItem {
  id: string;
  title: string;
  caseNumber: string;
  clientName: string;
  category: DocumentCategory;
  subcategory: string;
  uploadDate: string;
  fileSize: string;
}

/* -------------------------------------------------------------------------- */
/* DOCUMENT CATEGORIES                                                        */
/* -------------------------------------------------------------------------- */

const DOCUMENT_CATEGORIES: DocumentCategoryGroup[] = [
  {
    value: "Case Filing",
    label: "Case Filing",
    items: [
      { value: "Plaint", label: "Plaint" },
      { value: "Written Statement", label: "Written Statement" },
      { value: "Petition", label: "Petition" },
      { value: "Application", label: "Application" },
      { value: "Affidavit", label: "Affidavit" },
      { value: "Reply", label: "Reply" },
      { value: "Rejoinder", label: "Rejoinder" },
      { value: "Counter Affidavit", label: "Counter Affidavit" },
      { value: "Written Submissions", label: "Written Submissions" },
      { value: "Memo", label: "Memo" },
      { value: "Vakalatnama", label: "Vakalatnama" },
      { value: "Power of Attorney", label: "Power of Attorney" },
    ],
  },
  {
    value: "Evidence & Supporting Documents",
    label: "Evidence & Supporting Documents",
    items: [
      { value: "Evidence", label: "Evidence" },
      { value: "Exhibit", label: "Exhibit" },
      { value: "Documentary Evidence", label: "Documentary Evidence" },
      { value: "Witness Statement", label: "Witness Statement" },
      { value: "Witness Affidavit", label: "Witness Affidavit" },
      { value: "Deposition", label: "Deposition" },
      { value: "Expert Report", label: "Expert Report" },
      { value: "Medical Report", label: "Medical Report" },
      { value: "Forensic Report", label: "Forensic Report" },
      { value: "Photographs", label: "Photographs" },
      { value: "Video / Audio Evidence", label: "Video / Audio Evidence" },
    ],
  },
  {
    value: "Court Documents",
    label: "Court Documents",
    items: [
      { value: "Court Order", label: "Court Order" },
      { value: "Interim Order", label: "Interim Order" },
      { value: "Final Judgment", label: "Final Judgment" },
      { value: "Decree", label: "Decree" },
      { value: "Order Sheet", label: "Order Sheet" },
      { value: "Court Notice", label: "Court Notice" },
      { value: "Summons", label: "Summons" },
      { value: "Warrant", label: "Warrant" },
      { value: "Court Receipt", label: "Court Receipt" },
      { value: "Certified Copy", label: "Certified Copy" },
    ],
  },
  {
    value: "Case Administration",
    label: "Case Administration",
    items: [
      { value: "Case Filing Receipt", label: "Case Filing Receipt" },
      { value: "Case Registration", label: "Case Registration" },
      { value: "Case Status Report", label: "Case Status Report" },
      { value: "Cause List", label: "Cause List" },
      { value: "Hearing Notes", label: "Hearing Notes" },
      { value: "Court Proceedings", label: "Court Proceedings" },
      { value: "Compliance Report", label: "Compliance Report" },
      { value: "Case Transfer Document", label: "Case Transfer Document" },
    ],
  },
  {
    value: "Correspondence",
    label: "Correspondence",
    items: [
      { value: "Legal Notice", label: "Legal Notice" },
      { value: "Notice Reply", label: "Notice Reply" },
      { value: "Advocate Notice", label: "Advocate Notice" },
      { value: "Client Communication", label: "Client Communication" },
      {
        value: "Opposing Counsel Communication",
        label: "Opposing Counsel Communication",
      },
      { value: "Court Correspondence", label: "Court Correspondence" },
      { value: "Email Correspondence", label: "Email Correspondence" },
    ],
  },
  {
    value: "Agreements & Contracts",
    label: "Agreements & Contracts",
    items: [
      { value: "Agreement", label: "Agreement" },
      { value: "Contract", label: "Contract" },
      { value: "MoU", label: "MoU" },
      { value: "Settlement Agreement", label: "Settlement Agreement" },
      { value: "Undertaking", label: "Undertaking" },
      { value: "Indemnity", label: "Indemnity" },
      { value: "Deed", label: "Deed" },
    ],
  },
  {
    value: "Client Documents",
    label: "Client Documents",
    items: [
      { value: "Client ID Proof", label: "Client ID Proof" },
      { value: "Address Proof", label: "Address Proof" },
      { value: "Authorization Letter", label: "Authorization Letter" },
      { value: "PAN Card", label: "PAN Card" },
      { value: "Aadhaar Card", label: "Aadhaar Card" },
      { value: "Passport", label: "Passport" },
      { value: "Photograph", label: "Photograph" },
      { value: "Company Registration", label: "Company Registration" },
      { value: "GST Certificate", label: "GST Certificate" },
    ],
  },
  {
    value: "Financial",
    label: "Financial",
    items: [
      { value: "Invoice", label: "Invoice" },
      { value: "Payment Receipt", label: "Payment Receipt" },
      { value: "Fee Agreement", label: "Fee Agreement" },
      { value: "Expense Receipt", label: "Expense Receipt" },
      { value: "Court Fee Receipt", label: "Court Fee Receipt" },
    ],
  },
  {
    value: "Other",
    label: "Other",
    items: [
      { value: "Legal Research", label: "Legal Research" },
      { value: "Case Law", label: "Case Law" },
      { value: "Statute / Act", label: "Statute / Act" },
      { value: "Legal Opinion", label: "Legal Opinion" },
      { value: "Draft Document", label: "Draft Document" },
      { value: "Miscellaneous", label: "Miscellaneous" },
    ],
  },
];

/* -------------------------------------------------------------------------- */
/* HELPER FUNCTIONS                                                           */
/* -------------------------------------------------------------------------- */

function getCategoryGroup(category: string) {
  return DOCUMENT_CATEGORIES.find((item) => item.value === category);
}

function getSubcategoryLabel(category: string, subcategory: string) {
  const group = getCategoryGroup(category);

  return (
    group?.items.find((item) => item.value === subcategory)?.label ||
    subcategory
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function AdvocateDocumentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState<
    DocumentCategory | "All"
  >("All");

  const [subcategoryFilter, setSubcategoryFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Upload form
  const [newTitle, setNewTitle] = useState("");
  const [newCaseNumber, setNewCaseNumber] =
    useState("CS/402/2025");
  const [newClientName, setNewClientName] =
    useState("M/s. Apex Corp");

  const [newCategory, setNewCategory] =
    useState<DocumentCategory>("Case Filing");

  const [newSubcategory, setNewSubcategory] =
    useState("Written Statement");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  /* ------------------------------------------------------------------------ */
  /* SAMPLE DOCUMENTS                                                        */
  /* ------------------------------------------------------------------------ */

  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc_01",
      title: "Written Statement & Counter Affidavit.pdf",
      caseNumber: "CS/402/2025",
      clientName: "M/s. Apex Corp",
      category: "Case Filing",
      subcategory: "Written Statement",
      uploadDate: "01 Sep 2026",
      fileSize: "4.2 MB",
    },
    {
      id: "doc_02",
      title: "Interim Stay Order Copy.pdf",
      caseNumber: "CRL/118/2026",
      clientName: "Ramesh Sharma",
      category: "Court Documents",
      subcategory: "Interim Order",
      uploadDate: "28 Aug 2026",
      fileSize: "1.8 MB",
    },
    {
      id: "doc_03",
      title: "Bank Statement Exhibits A-F.pdf",
      caseNumber: "WP/904/2024",
      clientName: "Krupali Traders",
      category: "Evidence & Supporting Documents",
      subcategory: "Exhibit",
      uploadDate: "20 Aug 2026",
      fileSize: "12.5 MB",
    },
  ]);

  /* ------------------------------------------------------------------------ */
  /* CURRENT SUBCATEGORIES                                                    */
  /* ------------------------------------------------------------------------ */

  const currentSubcategories = useMemo(() => {
    return (
      getCategoryGroup(newCategory)?.items || []
    );
  }, [newCategory]);

  const filterSubcategories = useMemo(() => {
    if (categoryFilter === "All") {
      return [];
    }

    return getCategoryGroup(categoryFilter)?.items || [];
  }, [categoryFilter]);

  /* ------------------------------------------------------------------------ */
  /* CATEGORY CHANGE                                                          */
  /* ------------------------------------------------------------------------ */

  const handleNewCategoryChange = (
    category: DocumentCategory
  ) => {
    setNewCategory(category);

    const group = getCategoryGroup(category);

    if (group && group.items.length > 0) {
      setNewSubcategory(group.items[0].value);
    } else {
      setNewSubcategory("");
    }
  };

  const handleCategoryFilterChange = (
    category: DocumentCategory | "All"
  ) => {
    setCategoryFilter(category);
    setSubcategoryFilter("All");
  };

  /* ------------------------------------------------------------------------ */
  /* UPLOAD                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUploadSubmit = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!selectedFile && !newTitle) {
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc_${Date.now()}`,
      title:
        selectedFile?.name ||
        newTitle ||
        "Untitled Document.pdf",
      caseNumber: newCaseNumber,
      clientName: newClientName,
      category: newCategory,
      subcategory: newSubcategory,
      uploadDate: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      fileSize: selectedFile
        ? `${(
            selectedFile.size /
            (1024 * 1024)
          ).toFixed(1)} MB`
        : "2.1 MB",
    };

    setDocuments((previous) => [
      newDoc,
      ...previous,
    ]);

    setIsModalOpen(false);
    setSelectedFile(null);
    setNewTitle("");
  };

  /* ------------------------------------------------------------------------ */
  /* FILTER DOCUMENTS                                                         */
  /* ------------------------------------------------------------------------ */

  const filteredDocs = documents.filter((doc) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      doc.title.toLowerCase().includes(search) ||
      doc.caseNumber.toLowerCase().includes(search) ||
      doc.clientName.toLowerCase().includes(search) ||
      doc.category.toLowerCase().includes(search) ||
      doc.subcategory.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "All" ||
      doc.category === categoryFilter;

    const matchesSubcategory =
      subcategoryFilter === "All" ||
      doc.subcategory === subcategoryFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubcategory
    );
  });

  /* ------------------------------------------------------------------------ */
  /* RESET UPLOAD FORM                                                        */
  /* ------------------------------------------------------------------------ */

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setNewTitle("");
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FolderOpen size={20} />
            </div>

            <h1 className="text-xl font-bold text-gray-900">
              Document Repository & Sharing
            </h1>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Securely upload, categorize, and share
            pleadings, court orders, and client
            evidence files.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
        >
          <Upload size={16} />
          Upload New File
        </button>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-2.5 text-gray-400"
            size={16}
          />

          <input
            type="text"
            placeholder="Search by file name, case, client, category..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
              Category
            </label>

            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  handleCategoryFilterChange(
                    e.target.value as
                      | DocumentCategory
                      | "All"
                  )
                }
                className="w-full appearance-none px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="All">
                  All Categories
                </option>

                {DOCUMENT_CATEGORIES.map(
                  (category) => (
                    <option
                      key={category.value}
                      value={category.value}
                    >
                      {category.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Subcategory Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-gray-500 mb-1">
              Subcategory
            </label>

            <div className="relative">
              <select
                value={subcategoryFilter}
                disabled={
                  categoryFilter === "All"
                }
                onChange={(e) =>
                  setSubcategoryFilter(
                    e.target.value
                  )
                }
                className="w-full appearance-none px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="All">
                  {categoryFilter === "All"
                    ? "Select a category first"
                    : "All Subcategories"}
                </option>

                {filterSubcategories.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={14}
                className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Document Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                <th className="py-3 px-4">
                  Document Title
                </th>

                <th className="py-3 px-4">
                  Case Number
                </th>

                <th className="py-3 px-4">
                  Client
                </th>

                <th className="py-3 px-4">
                  Category
                </th>

                <th className="py-3 px-4">
                  Subcategory
                </th>

                <th className="py-3 px-4">
                  Uploaded
                </th>

                <th className="py-3 px-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-12 text-gray-400"
                  >
                    No documents matched your
                    criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-gray-50/80 transition"
                  >
                    {/* Document */}
                    <td className="py-3.5 px-4 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        <FileText
                          size={16}
                          className="text-blue-500 shrink-0"
                        />

                        <div>
                          <p>{doc.title}</p>

                          <span className="text-[10px] text-gray-400 font-normal">
                            {doc.fileSize} •
                            End-to-end Encrypted{" "}
                            <Lock
                              size={10}
                              className="inline text-emerald-600"
                            />
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Case */}
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {doc.caseNumber}
                    </td>

                    {/* Client */}
                    <td className="py-3.5 px-4 text-gray-800">
                      {doc.clientName}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold whitespace-nowrap">
                        {doc.category}
                      </span>
                    </td>

                    {/* Subcategory */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold whitespace-nowrap">
                        {getSubcategoryLabel(
                          doc.category,
                          doc.subcategory
                        )}
                      </span>
                    </td>

                    {/* Upload date */}
                    <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                      {doc.uploadDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() =>
                          alert(
                            `Downloading ${doc.title}`
                          )
                        }
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition inline-flex items-center"
                        title="Download"
                      >
                        <Download size={14} />
                      </button>

                      <button
                        onClick={() =>
                          setDocuments((previous) =>
                            previous.filter(
                              (item) =>
                                item.id !==
                                doc.id
                            )
                          )
                        }
                        className="ml-2 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition inline-flex items-center"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Upload
                  size={16}
                  className="text-blue-600"
                />
                Upload Case Document
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleUploadSubmit}
              className="space-y-4 text-xs"
            >
              {/* Case */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Select Case Number
                </label>

                <select
                  value={newCaseNumber}
                  onChange={(e) => {
                    setNewCaseNumber(
                      e.target.value
                    );

                    if (
                      e.target.value ===
                      "CS/402/2025"
                    ) {
                      setNewClientName(
                        "M/s. Apex Corp"
                      );
                    } else if (
                      e.target.value ===
                      "CRL/118/2026"
                    ) {
                      setNewClientName(
                        "Ramesh Sharma"
                      );
                    } else {
                      setNewClientName(
                        "Krupali Traders"
                      );
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="CS/402/2025">
                    CS/402/2025 - M/s. Apex Corp
                  </option>

                  <option value="CRL/118/2026">
                    CRL/118/2026 - Ramesh Sharma
                  </option>

                  <option value="WP/904/2024">
                    WP/904/2024 - Krupali Traders
                  </option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Document Category
                </label>

                <div className="relative">
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      handleNewCategoryChange(
                        e.target.value as DocumentCategory
                      )
                    }
                    className="w-full appearance-none px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {DOCUMENT_CATEGORIES.map(
                      (category) => (
                        <option
                          key={category.value}
                          value={category.value}
                        >
                          {category.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Subcategory */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Document Subcategory
                </label>

                <div className="relative">
                  <select
                    value={newSubcategory}
                    onChange={(e) =>
                      setNewSubcategory(
                        e.target.value
                      )
                    }
                    className="w-full appearance-none px-3 py-2 pr-9 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {currentSubcategories.map(
                      (item) => (
                        <option
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* File */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Choose File (PDF / Image)
                </label>

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (
                      e.target.files &&
                      e.target.files[0]
                    ) {
                      setSelectedFile(
                        e.target.files[0]
                      );
                    }
                  }}
                  className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />

                {selectedFile && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-lg text-[10px] text-blue-700">
                    Selected:{" "}
                    <span className="font-semibold">
                      {selectedFile.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm"
                >
                  Upload & Secure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}