import Link from "next/link";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const tasks = [
    {
      id: "1",
      title: "Prepare Affidavit",
      dueDate: "2026-06-25",
      status: "PENDING",
    },
    {
      id: "2",
      title: "Client Meeting",
      dueDate: "2026-06-26",
      status: "COMPLETED",
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Tasks</h1>

        <Link
          href="/staff/tasks/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} />
          New Task
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">Task</th>
              <th className="text-left p-4">Due Date</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t">
                <td className="p-4">{task.title}</td>
                <td className="p-4">{task.dueDate}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded ${
                      task.status === "COMPLETED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}