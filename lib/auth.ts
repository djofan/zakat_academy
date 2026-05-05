import NextAuth, { AuthOptions, User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@/generated/prisma/client";

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        nis: { label: "NIS", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
  if (!credentials?.nis || !credentials?.password) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { nis: credentials.nis as string },
    select: {
      id: true,
      nis: true,
      passwordHash: true,
      role: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user || !user.passwordHash) return null;

  const isValid = await bcrypt.compare(
    credentials.password as string,
    user.passwordHash
  );

  if (!isValid) return null;

        return {
          id: user.id,
          email: user.email ?? '',
          name: user.name ?? '',
          nis: user.nis ?? '',
          role: user.role,
          image: user.image ?? null,
        } as User & { nis?: string };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role ?? Role.STUDENT;
        token.nis = (user as { nis?: string }).nis ?? '';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        (session.user as { nis?: string }).nis = token.nis as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);