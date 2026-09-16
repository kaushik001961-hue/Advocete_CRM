"use client";

import { useRouter } from "next/navigation";
import TaskForm from "@/components/tasks/TaskForm";

export default function NewTaskPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Create Task
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and assign a legal work task to an advocate or staff member.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <TaskForm
            onSuccess={() => {
              router.push("/admin/tasks");
              router.refresh();
            }}
            onCancel={() => {
              router.push("/admin/tasks");
            }}
          />
        </div>
      </div>
    </main>
  );
}