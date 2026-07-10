"use client";

import { useState } from "react";

export default function NewTaskPage() {
 const [form, setForm] = useState({
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  assignedTo: "",
});

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate,
        assignedTo: form.assignedTo,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    alert("Task created successfully");

    setForm({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedTo: "",
    });
  } catch (error) {
    console.error(error);
    alert("Error creating task");
  }
};

  return (
    <div className="max-w-3xl p-6">
      <h1 className="text-3xl font-bold mb-6">Create Task</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4"
      >
        <input
          placeholder="Task Title"
          className="w-full border p-3 rounded"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
        />
        <input
  type="text"
  placeholder="Assigned User ID"
  className="w-full border p-3 rounded"
  value={form.assignedTo}
  onChange={(e) =>
    setForm({ ...form, assignedTo: e.target.value })
  }
/>

        <textarea
          rows={4}
          placeholder="Task Description"
          className="w-full border p-3 rounded"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <select
          className="w-full border p-3 rounded"
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={form.dueDate}
          onChange={(e) =>
            setForm({ ...form, dueDate: e.target.value })
          }
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded"
          type="submit"
        >
          Create Task
        </button>
      </form>
    </div>
  );
}