import Link from "next/link";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Client",
      href: "/admin/clients/new",
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Add Case",
      href: "/admin/cases/new",
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      title: "Add Hearing",
      href: "/admin/hearings/new",
      color: "bg-purple-600 hover:bg-purple-700",
    },
    {
      title: "Upload Document",
      href: "/admin/documents",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      title: "Billing",
      href: "/admin/billing",
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      title: "Reports",
      href: "/admin/reports",
      color: "bg-slate-700 hover:bg-slate-800",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        Quick Actions
      </h2>

      <div className="flex flex-wrap gap-3">
        {actions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={`px-5 py-3 text-sm font-medium text-white rounded-lg transition ${item.color}`}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}