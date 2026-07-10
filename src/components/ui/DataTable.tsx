import { ReactNode } from "react";

interface DataTableProps {
  headers: string[];
  children: ReactNode;
}

export default function DataTable({
  headers,
  children,
}: DataTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="p-4 text-left font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  );
}