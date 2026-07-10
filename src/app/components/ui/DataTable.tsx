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
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap"
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