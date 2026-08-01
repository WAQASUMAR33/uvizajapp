import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/not-found",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { customRole: true },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        let parsedPermissions: string[] | null = null;
        if (user.permissions) {
          try { parsedPermissions = JSON.parse(user.permissions); } catch {}
        }

        let parsedRolePermissions: string[] | null = null;
        if (user.customRole?.permissions) {
          try { parsedRolePermissions = JSON.parse(user.customRole.permissions); } catch {}
        }

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          permissions: parsedPermissions,
          rolePermissions: parsedRolePermissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.permissions = (user as any).permissions;
        token.rolePermissions = (user as any).rolePermissions;
      } else if (token.id) {
        // Fetch fresh permissions on token refresh
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: parseInt(token.id as string, 10) },
            include: { customRole: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.permissions = dbUser.permissions ? JSON.parse(dbUser.permissions) : null;
            token.rolePermissions = dbUser.customRole?.permissions ? JSON.parse(dbUser.customRole.permissions) : null;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).permissions = token.permissions as string[] | null;
        (session.user as any).rolePermissions = token.rolePermissions as string[] | null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
