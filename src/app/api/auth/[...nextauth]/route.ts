import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { admin } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await db.select().from(admin).where(eq(admin.email, credentials.email));
        if (user.length === 0) return null;

        const currentUser = user[0];
        const isValid = await bcrypt.compare(credentials.password, currentUser.password_hash);
        if (!isValid) return null;

        return {
          id: currentUser.id.toString(),
          name: currentUser.username,
          email: currentUser.email,
          role: currentUser.role, // ✅ Consistent key: `role`
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string; // ✅ FIXED
      session.user.type = token.type as string; // ✅ FIXED
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
});

export { handler as GET, handler as POST };
