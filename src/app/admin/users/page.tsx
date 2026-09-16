"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Edit,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "ADVOCATE" | "STAFF";
  status: string;
  phone: string | null;
  specialisation: string | null;
  experienceYears: number | null;
  barEnrollmentNo: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt?: string;
};

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "STAFF" as "ADMIN" | "ADVOCATE" | "STAFF",
  status: "Active",
  phone: "",
  specialisation: "",
  experienceYears: "",
  barEnrollmentNo: "",
};

function roleLabel(role: User["role"]) {
  if (role === "ADMIN") return "Administrator";
  if (role === "ADVOCATE") return "Advocate";
  return "Staff";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load users."
        );
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load users error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load users."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        roleLabel(user.role)
          .toLowerCase()
          .includes(term) ||
        (user.phone || "")
          .toLowerCase()
          .includes(term);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        user.status.toLowerCase() ===
          statusFilter.toLowerCase();

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const stats = {
    total: users.length,

    admins: users.filter(
      (user) => user.role === "ADMIN"
    ).length,

    advocates: users.filter(
      (user) => user.role === "ADVOCATE"
    ).length,

    staff: users.filter(
      (user) => user.role === "STAFF"
    ).length,

    active: users.filter(
      (user) =>
        user.status.toLowerCase() === "active"
    ).length,
  };

  function selectAllUsers() {
    setRoleFilter("ALL");
    setStatusFilter("ALL");
  }

  function selectAdmins() {
    setRoleFilter("ADMIN");
    setStatusFilter("ALL");
  }

  function selectAdvocates() {
    setRoleFilter("ADVOCATE");
    setStatusFilter("ALL");
  }

  function selectStaff() {
    setRoleFilter("STAFF");
    setStatusFilter("ALL");
  }

  function selectActive() {
    setRoleFilter("ALL");
    setStatusFilter("Active");
  }

  function openCreate() {
    setEditingUser(null);
    setForm({
      ...EMPTY_FORM,
    });
    setError("");
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
      phone: user.phone || "",
      specialisation: user.specialisation || "",
      experienceYears:
        user.experienceYears?.toString() || "",
      barEnrollmentNo:
        user.barEnrollmentNo || "",
    });

    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingUser(null);
    setForm({
      ...EMPTY_FORM,
    });
  }

  function updateField(
    field: keyof typeof EMPTY_FORM,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (
      !editingUser &&
      form.password.length < 6
    ) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      form.experienceYears !== "" &&
      Number(form.experienceYears) < 0
    ) {
      setError(
        "Experience years cannot be negative."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        status: form.status,
        phone: form.phone.trim() || null,
        specialisation:
          form.specialisation.trim() || null,
        experienceYears:
          form.experienceYears === ""
            ? 0
            : Number(form.experienceYears),
        barEnrollmentNo:
          form.barEnrollmentNo.trim() || null,

        ...(form.password
          ? {
              password: form.password,
            }
          : {}),
      };

      const url = editingUser
        ? `/api/users/${editingUser.id}`
        : "/api/users";

      const response = await fetch(url, {
        method: editingUser ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to save user."
        );
      }

      if (editingUser) {
        setUsers((current) =>
          current.map((item) =>
            item.id === data.id
              ? data
              : item
          )
        );
      } else {
        setUsers((current) => [
          data,
          ...current,
        ]);
      }

      closeForm();
    } catch (err) {
      console.error(
        "Save user error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save user."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(user: User) {
    const confirmed = window.confirm(
      `Delete "${user.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(
        `/api/users/${user.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to delete user."
        );
      }

      setUsers((current) =>
        current.filter(
          (item) => item.id !== user.id
        )
      );
    } catch (err) {
      console.error(
        "Delete user error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete user."
      );
    }
  }

  const isAllSelected =
    roleFilter === "ALL" &&
    statusFilter === "ALL";

  const isAdminSelected =
    roleFilter === "ADMIN";

  const isAdvocateSelected =
    roleFilter === "ADVOCATE";

  const isStaffSelected =
    roleFilter === "STAFF";

  const isActiveSelected =
    roleFilter === "ALL" &&
    statusFilter === "Active";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =========================
            HEADER
        ========================== */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                User Management
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage administrators, advocates and staff.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                void loadUsers(true)
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />

              Add User
            </button>
          </div>
        </div>

        {/* =========================
            ERROR
        ========================== */}
        {error && !showForm && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-md p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* =========================
            STATISTICS
        ========================== */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          <StatCard
            label="Total Users"
            value={stats.total}
            icon={
              <Users className="h-5 w-5" />
            }
            active={isAllSelected}
            onClick={selectAllUsers}
          />

          <StatCard
            label="Administrators"
            value={stats.admins}
            icon={
              <ShieldCheck className="h-5 w-5" />
            }
            active={isAdminSelected}
            onClick={selectAdmins}
          />

          <StatCard
            label="Advocates"
            value={stats.advocates}
            icon={
              <UserCheck className="h-5 w-5" />
            }
            active={isAdvocateSelected}
            onClick={selectAdvocates}
          />

          <StatCard
            label="Staff"
            value={stats.staff}
            icon={
              <Users className="h-5 w-5" />
            }
            active={isStaffSelected}
            onClick={selectStaff}
          />

          <StatCard
            label="Active"
            value={stats.active}
            icon={
              <UserCheck className="h-5 w-5" />
            }
            active={isActiveSelected}
            onClick={selectActive}
          />

        </div>

        {/* =========================
            FILTERS
        ========================== */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search name or email..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            {/* Role */}
            <select
              value={roleFilter}
              onChange={(event) =>
                setRoleFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">
                All Roles
              </option>

              <option value="ADMIN">
                Administrators
              </option>

              <option value="ADVOCATE">
                Advocates
              </option>

              <option value="STAFF">
                Staff
              </option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="ALL">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

          </div>
        </div>

        {/* =========================
            USERS TABLE
        ========================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              System Users
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing{" "}
              {filteredUsers.length} of{" "}
              {users.length} users
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50 dark:bg-slate-950">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-sm text-slate-500"
                    >
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center"
                    >
                      <Users className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
                        No users found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(
                    (user) => (
                      <tr
                        key={user.id}
                        className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
                      >

                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                              {user.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {user.name}
                              </p>

                              <p className="truncate text-xs text-slate-500">
                                {user.email}
                              </p>
                            </div>

                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.role ===
                              "ADMIN"
                                ? "bg-purple-50 text-purple-700"
                                : user.role ===
                                  "ADVOCATE"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {roleLabel(
                              user.role
                            )}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                          {user.phone ||
                            "—"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              user.status
                                .toLowerCase() ===
                              "active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(
                            user.createdAt
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                openEdit(
                                  user
                                )
                              }
                              className="rounded-lg bg-blue-50 p-2 text-blue-600 transition hover:bg-blue-100"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                void handleDelete(
                                  user
                                )
                              }
                              className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================
          CREATE / EDIT MODAL
      ========================== */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div
            className="absolute inset-0"
            onClick={closeForm}
          />

          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-slate-900">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingUser
                    ? "Edit User"
                    : "Create User"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {editingUser
                    ? "Update user account and permissions."
                    : "Create a new CRM user account."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <Field
                  label="Full Name"
                  value={form.name}
                  onChange={(value) =>
                    updateField(
                      "name",
                      value
                    )
                  }
                  required
                />

                <Field
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={(value) =>
                    updateField(
                      "email",
                      value
                    )
                  }
                  required
                />

                <Field
                  label={
                    editingUser
                      ? "New Password"
                      : "Password"
                  }
                  type="password"
                  value={form.password}
                  onChange={(value) =>
                    updateField(
                      "password",
                      value
                    )
                  }
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : "Minimum 6 characters"
                  }
                  required={!editingUser}
                />

                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    value={form.role}
                    onChange={(event) =>
                      updateField(
                        "role",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="STAFF">
                      Staff
                    </option>

                    <option value="ADVOCATE">
                      Advocate
                    </option>

                    <option value="ADMIN">
                      Administrator
                    </option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Status
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                    disabled={saving}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>

                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    updateField(
                      "phone",
                      value
                    )
                  }
                />

                <Field
                  label="Experience Years"
                  type="number"
                  value={
                    form.experienceYears
                  }
                  onChange={(value) =>
                    updateField(
                      "experienceYears",
                      value
                    )
                  }
                />

                <Field
                  label="Bar Enrollment No."
                  value={
                    form.barEnrollmentNo
                  }
                  onChange={(value) =>
                    updateField(
                      "barEnrollmentNo",
                      value
                    )
                  }
                />

                <Field
                  label="Specialisation"
                  value={
                    form.specialisation
                  }
                  onChange={(value) =>
                    updateField(
                      "specialisation",
                      value
                    )
                  }
                />

              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end dark:border-slate-800">

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  label,
  value,
  icon,
  onClick,
  active = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-slate-900 ${
        active
          ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-100 dark:border-blue-500 dark:bg-blue-950/20 dark:ring-blue-950"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between">

        <span className="text-xs font-medium text-slate-500">
          {label}
        </span>

        <span
          className={`transition ${
            active
              ? "text-blue-600"
              : "text-slate-400 group-hover:text-blue-600"
          }`}
        >
          {icon}
        </span>

      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>

      <p
        className={`mt-1 text-[11px] ${
          active
            ? "font-medium text-blue-600"
            : "text-slate-400"
        }`}
      >
        {active
          ? "Currently selected"
          : "Click to filter"}
      </p>
    </button>
  );
}

/* =====================================================
   FORM FIELD
===================================================== */

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
    </div>
  );
}