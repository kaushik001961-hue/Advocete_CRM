"use client";

/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  UserCheck,
  UserX,
  Clock,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  X,
  Filter,
  Loader2,
  Pencil,
  Bell,
  MessageCircle,
  Check,
} from "lucide-react";

export interface Advocate {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialisation: string;
  experienceYears: number;
  status: "Active" | "Inactive" | "On Leave";
  barEnrollmentNo: string;
  activeCases: number;
  emailNotifications: boolean;
  whatsappNotifications: boolean;
}

export default function AdvocatesPage() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedAdvocate, setSelectedAdvocate] =
    useState<Advocate | null>(null);

  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  // Add Advocate Form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialisation: "Criminal Law & Civil Litigation",
    experienceYears: 1,
    barEnrollmentNo: "",
    status: "Active" as Advocate["status"],
  });

  // Edit Advocate Form
  const [editFormData, setEditFormData] = useState({
    email: "",
    phone: "",
    emailNotifications: true,
    whatsappNotifications: true,
  });

  // --------------------------------------------------
  // Fetch Advocates
  // --------------------------------------------------

  useEffect(() => {
    async function fetchAdvocates() {
      try {
        const res = await fetch("/api/advocates");

        if (res.ok) {
          const data = await res.json();
          setAdvocates(data);
        }
      } catch (err) {
        console.error("Failed to fetch advocates:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvocates();
  }, []);

  // --------------------------------------------------
  // Search / Filter
  // --------------------------------------------------

  const filteredAdvocates = advocates.filter((adv) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      adv.name?.toLowerCase().includes(query) ||
      adv.email?.toLowerCase().includes(query) ||
      adv.phone?.toLowerCase().includes(query) ||
      (adv.specialisation &&
        adv.specialisation.toLowerCase().includes(query)) ||
      (adv.barEnrollmentNo &&
        adv.barEnrollmentNo.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === "ALL" || adv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // --------------------------------------------------
  // Create Advocate
  // --------------------------------------------------

  const handleCreateAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) return;

    try {
      const res = await fetch("/api/advocates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newAdvocate = await res.json();

        setAdvocates((prev) => [newAdvocate, ...prev]);

        setIsModalOpen(false);

        setFormData({
          name: "",
          email: "",
          phone: "",
          specialisation: "Criminal Law & Civil Litigation",
          experienceYears: 1,
          barEnrollmentNo: "",
          status: "Active",
        });
      } else {
        const data = await res.json().catch(() => null);
        console.error("Failed to create advocate:", data);
      }
    } catch (err) {
      console.error("Failed to save advocate:", err);
    }
  };

  // --------------------------------------------------
  // Open Edit Modal
  // --------------------------------------------------

  const openEditModal = (advocate: Advocate) => {
    setSelectedAdvocate(advocate);

    setEditFormData({
      email: advocate.email || "",
      phone: advocate.phone || "",
      emailNotifications: advocate.emailNotifications ?? true,
      whatsappNotifications: advocate.whatsappNotifications ?? true,
    });

    setSaveMessage("");
    setSaveError("");
    setIsEditModalOpen(true);
  };

  // --------------------------------------------------
  // Save Advocate Settings
  // --------------------------------------------------

  const handleUpdateAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAdvocate) return;

    setSaving(true);
    setSaveMessage("");
    setSaveError("");

    try {
      const res = await fetch(
        `/api/advocates/${selectedAdvocate.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: editFormData.email.trim(),
            phone: editFormData.phone.trim() || null,
            emailNotifications: editFormData.emailNotifications,
            whatsappNotifications:
              editFormData.whatsappNotifications,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error || "Failed to update advocate."
        );
      }

      const updated = data.advocate;

      setAdvocates((prev) =>
        prev.map((item) =>
          item.id === updated.id
            ? {
                ...item,
                email: updated.email,
                phone: updated.phone || "",
                emailNotifications:
                  updated.emailNotifications,
                whatsappNotifications:
                  updated.whatsappNotifications,
              }
            : item
        )
      );

      setSelectedAdvocate((prev) =>
        prev
          ? {
              ...prev,
              email: updated.email,
              phone: updated.phone || "",
              emailNotifications:
                updated.emailNotifications,
              whatsappNotifications:
                updated.whatsappNotifications,
            }
          : prev
      );

      setSaveMessage("Advocate notification settings saved.");
    } catch (error) {
      console.error("UPDATE_ADVOCATE_ERROR", error);

      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to update advocate."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // Status Badge
  // --------------------------------------------------

  const getStatusBadge = (status: Advocate["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck size={13} />
            Active
          </span>
        );

      case "On Leave":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={13} />
            On Leave
          </span>
        );

      case "Inactive":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <UserX size={13} />
            Inactive
          </span>
        );
    }
  };

  // --------------------------------------------------
  // Notification Badge
  // --------------------------------------------------

  const getNotificationBadges = (adv: Advocate) => {
    return (
      <div className="flex flex-wrap gap-1.5">
        {adv.emailNotifications ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-medium">
            <Mail size={11} />
            Email
          </span>
        ) : null}

        {adv.whatsappNotifications ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 border border-green-100 text-[11px] font-medium">
            <MessageCircle size={11} />
            WhatsApp
          </span>
        ) : null}

        {!adv.emailNotifications &&
          !adv.whatsappNotifications && (
            <span className="text-[11px] text-gray-400">
              Disabled
            </span>
          )}
      </div>
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck
              className="text-blue-600"
              size={26}
            />
            Advocates Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage legal practitioners, bar credentials,
            active caseloads, and notification preferences.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
        >
          <Plus size={18} />
          <span>Add Advocate</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1 w-full">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search by name, email, mobile, bar ID, or specialisation..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter
            size={18}
            className="text-gray-400 shrink-0"
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-slate-50 text-gray-700 font-semibold border-b border-gray-200 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Advocate</th>
                <th className="px-6 py-4">Bar Reg. No</th>
                <th className="px-6 py-4">
                  Specialisation
                </th>
                <th className="px-6 py-4">
                  Experience
                </th>
                <th className="px-6 py-4">Cases</th>
                <th className="px-6 py-4">Notifications</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-500"
                  >
                    <Loader2
                      className="animate-spin inline-block mr-2 text-blue-600"
                      size={20}
                    />
                    Loading database records...
                  </td>
                </tr>
              ) : filteredAdvocates.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-500"
                  >
                    No advocates matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredAdvocates.map((adv) => (
                  <tr
                    key={adv.id}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                          {adv.name?.charAt(0) || "A"}
                        </div>

                        <div>
                          <div className="font-semibold text-gray-900">
                            {adv.name}
                          </div>

                          <div className="text-xs text-gray-500 flex flex-col gap-0.5 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail size={12} />
                              {adv.email}
                            </span>

                            {adv.phone && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} />
                                {adv.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-700 font-semibold">
                      {adv.barEnrollmentNo || "N/A"}
                    </td>

                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {adv.specialisation ||
                        "General Practice"}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {adv.experienceYears || 0} yrs
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {adv.activeCases || 0}
                    </td>

                    <td className="px-6 py-4">
                      {getNotificationBadges(adv)}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(
                        adv.status || "Active"
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          openEditModal(adv)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition text-xs font-medium"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {loading ? (
          <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500">
            <Loader2
              className="animate-spin inline-block mr-2 text-blue-600"
              size={20}
            />
            Loading advocates...
          </div>
        ) : filteredAdvocates.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white rounded-xl border border-gray-200 text-gray-500">
            No advocates found.
          </div>
        ) : (
          filteredAdvocates.map((adv) => (
            <div
              key={adv.id}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                    {adv.name?.charAt(0) || "A"}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {adv.name}
                    </h3>

                    <p className="text-xs font-mono text-gray-500">
                      {adv.barEnrollmentNo || "N/A"}
                    </p>
                  </div>
                </div>

                {getStatusBadge(
                  adv.status || "Active"
                )}
              </div>

              <div className="space-y-1.5 text-xs text-gray-600 border-t border-b border-gray-100 py-3">
                <div className="flex items-center gap-2">
                  <Briefcase
                    size={14}
                    className="text-gray-400"
                  />
                  <span className="font-medium text-gray-800">
                    {adv.specialisation ||
                      "General Practice"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Mail
                    size={14}
                    className="text-gray-400"
                  />
                  <span>{adv.email}</span>
                </div>

                {adv.phone && (
                  <div className="flex items-center gap-2">
                    <Phone
                      size={14}
                      className="text-gray-400"
                    />
                    <span>{adv.phone}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Notifications
                </p>

                {getNotificationBadges(adv)}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Experience:{" "}
                  <strong className="text-gray-700">
                    {adv.experienceYears || 0} yrs
                  </strong>
                </span>

                <span>
                  Active Cases:{" "}
                  <strong className="text-gray-900">
                    {adv.activeCases || 0}
                  </strong>
                </span>
              </div>

              <button
                onClick={() => openEditModal(adv)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition text-sm font-medium"
              >
                <Pencil size={15} />
                Edit Advocate & Notifications
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Advocate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                Add New Advocate
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleCreateAdvocate}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  required
                  placeholder="Adv. Rajesh Sharma"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    placeholder="advocate@crm.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Bar Reg. No
                  </label>

                  <input
                    type="text"
                    placeholder="MAH/1042/2012"
                    value={formData.barEnrollmentNo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        barEnrollmentNo: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Experience (Yrs)
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: Number(
                          e.target.value
                        ),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Specialisation
                  </label>

                  <select
                    value={formData.specialisation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialisation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Criminal Law & Civil Litigation">
                      Criminal Law & Civil Litigation
                    </option>
                    <option value="Corporate & IPR Law">
                      Corporate & IPR Law
                    </option>
                    <option value="Family & Matrimonial Law">
                      Family & Matrimonial Law
                    </option>
                    <option value="Constitutional & Revenue Law">
                      Constitutional & Revenue Law
                    </option>
                    <option value="Arbitration & Commercial Law">
                      Arbitration & Commercial Law
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target
                          .value as Advocate["status"],
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700">
                New advocates will have Email and WhatsApp
                notifications enabled by default.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  Save Advocate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Advocate Modal */}
      {isEditModalOpen && selectedAdvocate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Edit Advocate
                </h2>

                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedAdvocate.name}
                </p>
              </div>

              <button
                onClick={() =>
                  setIsEditModalOpen(false)
                }
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpdateAdvocate}
              className="p-6 space-y-5"
            >

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        email: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Mobile Number
                </label>

                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell
                    size={17}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-gray-900">
                    Notification Preferences
                  </h3>
                </div>

                <div className="space-y-3">

                  {/* Email */}
                  <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Mail size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Email Notifications
                        </p>

                        <p className="text-xs text-gray-500">
                          Send case, hearing, task and billing alerts by email.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        editFormData.emailNotifications
                      }
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          emailNotifications:
                            e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-blue-600"
                    />
                  </label>

                  {/* WhatsApp */}
                  <label className="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                        <MessageCircle size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          WhatsApp Notifications
                        </p>

                        <p className="text-xs text-gray-500">
                          Send important alerts to the advocate's mobile.
                        </p>
                      </div>
                    </div>

                    <input
                      type="checkbox"
                      checked={
                        editFormData.whatsappNotifications
                      }
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          whatsappNotifications:
                            e.target.checked,
                        })
                      }
                      className="w-5 h-5 accent-green-600"
                    />
                  </label>
                </div>
              </div>

              {/* Success */}
              {saveMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <Check size={16} />
                  {saveMessage}
                </div>
              )}

              {/* Error */}
              {saveError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() =>
                    setIsEditModalOpen(false)
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg transition"
                >
                  {saving && (
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}