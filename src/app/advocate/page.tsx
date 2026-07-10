import { prisma } from "@/lib/prisma";

export default async function AdvocatesPage() {
  const advocates = await prisma.user.findMany({
    where: { role: "ADVOCATE" }, // Adjust this filter to match your schema's role field
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Advocates Management</h1>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-200 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
            {advocates.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-neutral-400 italic">
                  No advocates found.
                </td>
              </tr>
            ) : (
              advocates.map((advocate) => (
                <tr key={advocate.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="p-4 font-medium text-neutral-900">{advocate.name || "N/A"}</td>
                  <td className="p-4">{advocate.email}</td>
                  <td className="p-4">{new Date(advocate.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}