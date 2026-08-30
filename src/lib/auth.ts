import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";

const providers: any[] = [];

// If Google OAuth credentials are provided, register GoogleProvider
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Always register Demo / Local Dev CredentialsProvider for instant 1-click access
providers.push(
  CredentialsProvider({
    id: "demo",
    name: "Demo Account",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "mark@example.com" },
      name: { label: "Name", type: "text", placeholder: "Mark" },
    },
    async authorize(credentials) {
      const email = credentials?.email || "mark@example.com";
      const name = credentials?.name || "Mark";

      // Find or create user in SQLite database
      let user = await db.user.findUnique({
        where: { email },
      });

      if (!user) {
        user = await db.user.create({
          data: {
            email,
            name,
            image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
          },
        });
      }

      return user;
    },
  })
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "japan-trip-secret-key-development-mode-12345",
};

export async function getAuthSession() {
  return await getServerSession(authOptions);
}
