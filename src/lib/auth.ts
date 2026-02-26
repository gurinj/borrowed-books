import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, account, profile }) {
      if (account && profile) {
        // Keycloak roles live in realm_access.roles
        // Create a client role "bookshelf-admin" in Keycloak for admins
        const realmRoles =
          (profile as { realm_access?: { roles?: string[] } }).realm_access
            ?.roles ?? [];
        token.role = realmRoles.includes("bookshelf-admin")
          ? "admin"
          : "employee";
        token.sub = profile.sub;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub as string;
      session.user.role = token.role as "admin" | "employee";
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
