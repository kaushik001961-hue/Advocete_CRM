"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type CaseNote = {
  id: string;
  caseId: string;
  title?: string | null;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type CaseNotesProps = {
  caseId: string;
};

function formatDate(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CaseNotes({
  caseId,
}: CaseNotesProps) {
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadNotes = async () => {
      try {
        const response = await fetch(
          `/api/cases/${caseId}/notes`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load case notes."
          );
        }

        if (!cancelled) {
          setNotes(data.notes ?? []);
        }
      } catch (err) {
        console.error("Case notes load error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load case notes."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadNotes();

    return () => {
      cancelled = true;
    };
  }, [caseId]);

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingNoteId("");
    setError("");
    setSuccess("");
  }

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  function openEditModal(note: CaseNote) {
    setError("");
    setSuccess("");

    setEditingNoteId(note.id);
    setTitle(note.title ?? "");
    setContent(note.content);

    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    resetForm();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please enter note content.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const isEditing = Boolean(editingNoteId);

      const response = await fetch(
        `/api/cases/${caseId}/notes`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...(isEditing
              ? { noteId: editingNoteId }
              : {}),
            title: title.trim() || null,
            content: content.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to ${
              isEditing ? "update" : "create"
            } note.`
        );
      }

      setNotes((current) => {
        if (isEditing) {
          return current
            .map((note) =>
              note.id === editingNoteId
                ? data.note
                : note
            )
            .sort(
              (a, b) =>
                new Date(b.updatedAt).getTime() -
                new Date(a.updatedAt).getTime()
            );
        }

        return [data.note, ...current];
      });

      setSuccess(
        isEditing
          ? "Note updated successfully."
          : "Note added successfully."
      );

      window.setTimeout(() => {
        setShowModal(false);
        resetForm();
      }, 500);
    } catch (err) {
      console.error("Case note save error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save note."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(noteId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(noteId);
      setError("");

      const response = await fetch(
        `/api/cases/${caseId}/notes?noteId=${encodeURIComponent(
          noteId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to delete note."
        );
      }

      setNotes((current) =>
        current.filter((note) => note.id !== noteId)
      );
    } catch (err) {
      console.error("Case note delete error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete note."
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
            <FileText
              size={18}
              className="text-blue-600"
            />

            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Case Notes
              </h2>

              <p className="text-[11px] text-gray-400">
                Internal notes and case-related information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={14} />
            Add Note
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
          <div className="flex min-h-40 items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2
                size={16}
                className="animate-spin"
              />

              Loading notes...
            </div>
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              <FileText size={18} />
            </div>

            <p className="mt-3 text-sm font-semibold text-gray-700">
              No case notes
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Add internal notes, discussions, strategy,
              or follow-up information.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Add First Note
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText size={16} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-gray-900">
                          {note.title || "Untitled Note"}
                        </h3>

                        <p className="mt-1 text-[10px] text-gray-400">
                          Created{" "}
                          {formatDateTime(note.createdAt)}
                        </p>

                        {new Date(
                          note.updatedAt
                        ).getTime() !==
                          new Date(
                            note.createdAt
                          ).getTime() && (
                          <p className="mt-0.5 text-[10px] text-gray-400">
                            Updated{" "}
                            {formatDateTime(note.updatedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
                      <p className="whitespace-pre-wrap text-xs leading-5 text-gray-600">
                        {note.content}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(note)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      title="Edit note"
                    >
                      <Edit3 size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(note.id)
                      }
                      disabled={
                        deletingId === note.id
                      }
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Delete note"
                    >
                      {deletingId === note.id ? (
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
                  {editingNoteId
                    ? "Edit Case Note"
                    : "Add Case Note"}
                </h2>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  {editingNoteId
                    ? "Update the case note"
                    : "Record an internal note for this case"}
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
                  htmlFor="case-note-title"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Note Title
                </label>

                <input
                  id="case-note-title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="e.g. Client meeting discussion"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={saving}
                />
              </div>

              <div>
                <label
                  htmlFor="case-note-content"
                  className="mb-1.5 block text-xs font-semibold text-gray-700"
                >
                  Note
                </label>

                <textarea
                  id="case-note-content"
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value)
                  }
                  placeholder="Write your case note here..."
                  rows={7}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-xs leading-5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  disabled={saving}
                />
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
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingNoteId
                      ? "Update Note"
                      : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}