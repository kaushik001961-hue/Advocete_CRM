import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {

  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <div>Users Management</div>;
}