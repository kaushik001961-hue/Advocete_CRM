
import Link from "next/link";

export default function HearingTable({
  hearings,
}: {
  hearings: any[];
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full border rounded-lg">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-3 text-left">
              Date
            </th>

            <th className="p-3 text-left">
              Case
            </th>

            <th className="p-3 text-left">
              Client
            </th>

            <th className="p-3 text-left">
              Status
            </th>

            <th className="p-3 text-left">
              Next Hearing
            </th>

            <th className="p-3 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {hearings.map((hearing) => (

            <tr
              key={hearing.id}
              className="border-t"
            >

              <td className="p-3">
                {new Date(
                  hearing.date
                ).toLocaleString()}
              </td>

              <td className="p-3">
                {hearing.case.title}
              </td>

              <td className="p-3">
                {hearing.case.client.name}
              </td>

              <td className="p-3">

                <span
                  className={`px-3 py-1 rounded-full text-white
                  ${
                    hearing.status === "COMPLETED"
                      ? "bg-green-600"
                      : hearing.status === "ADJOURNED"
                      ? "bg-yellow-500"
                      : "bg-blue-600"
                  }`}
                >
                  {hearing.status}
                </span>

              </td>

              <td className="p-3">

                {hearing.nextDate
                  ? new Date(
                      hearing.nextDate
                    ).toLocaleDateString()
                  : "-"}

              </td>

              <td className="p-3 text-center space-x-3">

                <Link
                  href={`/admin/hearings/${hearing.id}`}
                  className="text-blue-600"
                >
                  View
                </Link>

                <Link
                  href={`/admin/hearings/${hearing.id}/edit`}
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
