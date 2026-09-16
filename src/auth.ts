import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type UserRole = "ADMIN" | "ADVOCATE" | "STAFF";

function isUserRole(value: unknown): value is UserRole {
  return (
    value === "ADMIN" ||
    value === "ADVOCATE" ||
    value === "STAFF"
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email);
        const password = String(credentials.password);

        const user = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          return null;
        }

        const valid = await bcrypt.compare(
          password,
          user.password
        );

        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user && isUserRole(user.role)) {
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && isUserRole(token.role)) {
        session.user.role = token.role;
      }

      return session;
    },
  },
});