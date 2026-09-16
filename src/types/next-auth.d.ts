import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "ADVOCATE" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "ADVOCATE" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "ADVOCATE" | "STAFF";
  }
}