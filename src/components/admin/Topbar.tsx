import { auth } from "@/auth";

export default async function Topbar() {
  const session = await auth();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">
      {session?.user?.name} Dashboard
      </h2>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Welcome, {session?.user?.name}
        </span>

        <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
          {session?.user?.name?.charAt(0)}
        </div>
      </div>
    </header>
  );
}