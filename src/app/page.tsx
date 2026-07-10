import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  // 1. Safe guard against missing sessions
  if (!session || !session.user) {
    redirect("/login");
  }

  // 2. Extract the role cleanly
  const role = session.user.role;

  // 3. Match and route efficiently
  if (role === "ADMIN") redirect("/admin");
  if (role === "ADVOCATE") redirect("/advocate");
  if (role === "STAFF") redirect("/staff");

  // Fallback if user has a role that isn't mapped
  redirect("/login");
}