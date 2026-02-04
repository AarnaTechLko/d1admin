// import { AuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// interface UserType {
//   id: string;
//   name: string;
//   username: string;
//   role: string;
//   type: string;
// }



// export const authOptions: AuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (
//           credentials?.email === "admin@test.com" &&
//           credentials.password === "123"
//         ) {
//           return {
//             id: "1",
//             name: "Admin User",
//             username: "Admin",
//             role: "admin",
//             type: "admin",
//           };
//         }
//         return null;
//       },
//     }),
//   ],
//   // session: { strategy: "jwt" },
//   session: {
//     strategy: "jwt", // or "database"
//     maxAge: 24 * 60 * 60, // session duration in seconds (here: 24 hours)
//   updateAge: 12 * 60 * 60, // refresh token every 12 hours
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.type = (user as UserType).type;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id as string;
//         session.user.role = token.role as string;
//         session.user.type = token.type as string;
//       }
//       return session;
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
// };

// export default authOptions;


import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { admin } from "schema";
import { eq } from 'drizzle-orm';
import { SECRET_KEY } from '@/lib/constants';
import bcrypt from 'bcryptjs';


// interface UserType {
//   id: string;
//   name: string;
//   username: string;
//   role: string;
//   type: string;
// }

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // if (
        //   credentials?.email === "admin@test.com" &&
        //   credentials.password === "123"
        // ) {
        //   return {
        //     id: "1",
        //     name: "Admin User",
        //     username: "Admin",
        //     role: "admin",
        //     type: "admin",
        //   };
        // }
        // return null;


        //Checks to see if credentials were provided
        if(!credentials){
          return null;
        }
        const { email, password } = credentials;

        //Checks to see if email and password was provided
        if (
          !email ||
          !password ||
          email.trim() === '' ||
          password.trim() === ''
        ) {
          return null;
        }

        //Retrieves the admins info
        const adminUser = await db
          .select({
            id: admin.id,
            password: admin.password_hash,
            is_deleted: admin.is_deleted,
            username: admin.username,
            email: admin.email,
            created_at: admin.created_at,
            role: admin.role,
            phone_number: admin.phone_number,
          })
          .from(admin)
          .where(eq(admin.email, email.toLowerCase()));

          //Uses bcrypt to compare the password retrieved from the db with the one inputted by the user
          if (
            adminUser.length === 0 ||
            !(await bcrypt.compare(password, adminUser[0].password))
          ) {
            return null; // Invalid credentials
          }
          else if (adminUser[0].is_deleted === 0) {
            throw new Error('Your account has been deleted.'); //Account has been deleted
          }
          else {
            //Returns the users info as an object
            return {
              id: adminUser[0].id.toString(),
              username: adminUser[0].username,
              email: adminUser[0].email,
              created_at: adminUser[0].created_at,
              role: adminUser[0].role,
              phone_number: adminUser[0].phone_number,
            }
          }

      },
    }),
  ],

  // Session configuration
  session: {
    strategy: "jwt", // JWT-based session
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 12 * 60 * 60, // refresh every 12 hours
  },

  // Make JWT cookie persistent across browser tabs
  cookies: {
    sessionToken: {
      name: `next-auth-app.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60, // 24 hours cookie lifetime
      },
    },
  },

  //JWT configuration
  jwt: {
    secret: SECRET_KEY ?? process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    // Add user data to JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.email = user.email;
        token.created_at = user.created_at;
        token.phone_number = user.phone_number;
      }
      return token;
    },

    // Map JWT token data to session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.created_at = token.created_at;
        session.user.phone_number = token.phone_number;
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin", // custom signin page
  },

  // Optional: debug mode in dev
  // debug: process.env.NODE_ENV === "development",
};

export default authOptions;
