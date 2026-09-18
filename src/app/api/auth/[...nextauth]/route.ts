import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For simplicity in this v1 single-owner app, we hardcode the admin login
        // Alternatively, we could check the database.
        if (credentials?.username === "admin" && credentials?.password === "admin123") {
          return { id: "1", name: "Business Owner", email: "admin@example.com" };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
