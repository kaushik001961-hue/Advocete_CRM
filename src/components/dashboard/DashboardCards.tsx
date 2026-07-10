import DashboardCard from "./DashboardCard"; // Fixed from "./DashboardCards" to "./DashboardCard"

interface Props {
  clients: number;
  cases: number;
  hearings: number;
  advocates: number;
}

export default function DashboardCards({
  clients,
  cases,
  hearings,
  advocates,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardCard title="Clients" value={clients} />
      <DashboardCard title="Cases" value={cases} />
      <DashboardCard title="Hearings" value={hearings} />
      <DashboardCard title="Advocates" value={advocates} />
    </div>
  );
}