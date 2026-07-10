import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdvocateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Not logged in
  if (!session) {
    redirect("/login");
  }

  // Only ADVOCATE can access
  if ((session.user as any).role !== "ADVOCATE") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {children}
    </div>
  );
}