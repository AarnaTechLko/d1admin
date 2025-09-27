import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
interface UserType {
  id: string;
  name: string;
  username: string;
  role: string;
  type: string;
}



export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials?.email === "admin@test.com" &&
          credentials.password === "123"
        ) {
          return {
            id: "1",
            name: "Admin User",
            username: "Admin",
            role: "admin",
            type: "admin",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.type = (user as UserType).type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.type = token.type as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default authOptions;
