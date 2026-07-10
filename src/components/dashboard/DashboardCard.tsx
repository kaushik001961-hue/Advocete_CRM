interface DashboardCardProps {
  title: string;
  value: number;
}

export default function DashboardCard({ title, value }: DashboardCardProps) {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}