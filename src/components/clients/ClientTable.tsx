
import Link from "next/link";

interface Props {
  clients: any[];
}

export default function ClientTable({
  clients,
}: Props) {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="text-left p-4">
              Name
            </th>

            <th className="text-left p-4">
              Phone
            </th>

            <th className="text-left p-4">
              Email
            </th>

            <th className="text-center p-4">
              Cases
            </th>

            <th className="text-center p-4">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {clients.map((client) => (

            <tr
              key={client.id}
              className="border-t"
            >

              <td className="p-4">
                {client.name}
              </td>

              <td className="p-4">
                {client.phone}
              </td>

              <td className="p-4">
                {client.email}
              </td>

              <td className="text-center p-4">
                {client.cases.length}
              </td>

              <td className="text-center p-4 space-x-2">

                <Link
                  href={`/admin/clients/${client.id}`}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  View
                </Link>

                <Link
                  href={`/admin/clients/${client.id}/edit`}
                  className="bg-yellow-500 text-white px-3 py-2 rounded"
                >
                  Edit
                </Link>

                <button
                  className="bg-red-600 text-white px-3 py-2 rounded"
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}
