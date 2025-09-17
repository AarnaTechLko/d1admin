import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@/lib/db"; // your Drizzle DB
// import { users } from "@/lib/schema"; // your Drizzle schema
// import { eq } from "drizzle-orm";
// import bcrypt from "bcrypt";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 🔹 Example hardcoded check (replace with Drizzle query)
        if (
          credentials?.email === "admin@test.com" &&
          credentials.password === "123"
        ) {
          return { id: "1", name: "Admin User", role: "admin" };
        }

        // Example with Drizzle:
        // const [user] = await db.select().from(users).where(eq(users.email, credentials.email));
        // if (user && await bcrypt.compare(credentials.password, user.password)) {
        //   return { id: user.id, name: user.name, role: user.role };
        // }

        return null; // if login fails
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login", // optional: your custom login page
  },
});

export { handler as GET, handler as POST };
