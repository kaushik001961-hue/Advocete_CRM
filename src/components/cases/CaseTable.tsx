import Link from "next/link";

interface CaseClient {
  name?: string | null;
}

interface CaseAdvocate {
  name?: string | null;
}

interface CaseItem {
  id: string;
  title?: string | null;
  client?: CaseClient | null;
  advocate?: CaseAdvocate | null;
  court?: string | null;
  status?: string | null;
}

interface CaseTableProps {
  cases: CaseItem[];
}

export default function CaseTable({
  cases,
}: CaseTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">
              Title
            </th>

            <th className="p-3 text-left">
              Client
            </th>

            <th className="p-3 text-left">
              Advocate
            </th>

            <th className="p-3 text-left">
              Court
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {cases.map((item) => (
            <tr
              key={item.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="p-3">
                {item.title}
              </td>

              <td className="p-3">
                {item.client?.name}
              </td>

              <td className="p-3">
                {item.advocate?.name}
              </td>

              <td className="p-3">
                {item.court}
              </td>

              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm
                  ${
                    item.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : item.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </td>

              <td className="p-3 space-x-3">
                <Link
                  href={`/admin/cases/${item.id}`}
                  className="text-blue-600"
                >
                  View
                </Link>

                <Link
                  href={`/admin/cases/${item.id}/edit`}
                  className="text-green-600"
                >
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}