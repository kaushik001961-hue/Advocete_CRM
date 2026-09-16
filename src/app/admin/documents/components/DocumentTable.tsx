import Link from "next/link";
import DocumentPreview from "@/components/documents/DocumentPreview";
import DeleteButton from "./DeleteButton";

interface DocumentClient {
  name?: string | null;
}

interface DocumentCase {
  title?: string | null;
}

interface DocumentItem {
  id: string;
  name: string;
  fileUrl: string;
  client?: DocumentClient | null;
  case?: DocumentCase | null;
}

interface DocumentTableProps {
  documents: DocumentItem[];
}

export default function DocumentTable({
  documents,
}: DocumentTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                Name
              </th>

              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Preview
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                Client
              </th>

              <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
                Case
              </th>

              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Download
              </th>

              <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
                Delete
              </th>
            </tr>
          </thead>

          <tbody>
            {documents.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-8 text-gray-500"
                >
                  No documents found
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t hover:bg-slate-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {doc.name}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <DocumentPreview url={doc.fileUrl} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {doc.client?.name || "-"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {doc.case?.title || "-"}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Link
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <DeleteButton id={doc.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}