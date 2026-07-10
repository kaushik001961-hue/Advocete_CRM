export default function ReportsPage() {
  const stats = {
    clients: 52,
    cases: 128,
    hearings: 35,
    documents: 420,
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports Dashboard</h1>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Clients</h3>
          <p className="text-3xl font-bold">{stats.clients}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Cases</h3>
          <p className="text-3xl font-bold">{stats.cases}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Hearings</h3>
          <p className="text-3xl font-bold">{stats.hearings}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Documents</h3>
          <p className="text-3xl font-bold">{stats.documents}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow mt-6 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Firm Performance Summary
        </h2>

        <p>Total Clients: {stats.clients}</p>
        <p>Total Cases: {stats.cases}</p>
        <p>Total Hearings: {stats.hearings}</p>
        <p>Total Documents: {stats.documents}</p>
      </div>
    </div>
  );
}