import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // expose role + location so we can use them in JWT / session
          role: user.role,
          location: user.location,
        } as {
          id: string;
          email: string;
          name: string;
          role: string;
          location: string | null;
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // user is only defined on initial sign-in
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role;
        token.location = (user as { location?: string | null }).location;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string; location?: string | null }).id =
          token.id as string;
        (session.user as { id?: string; role?: string; location?: string | null }).role =
          (token as { role?: string }).role;
        (session.user as { id?: string; role?: string; location?: string | null }).location =
          (token as { location?: string | null }).location ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};
