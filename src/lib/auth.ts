import NextAuth from "next-auth";

const useSecureCookies = process.env.NODE_ENV === "production";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // No providers: sign-in happens on the home site. This app only reads the
  // shared session cookie (same AUTH_SECRET + cookie name/domain as home).
  providers: [],
  session: { strategy: "jwt" },
  // Shared across 4hope.app subdomains (home + bracket) for single sign-on.
  // The cookie name doubles as the JWT salt, so it MUST match in both apps,
  // along with AUTH_SECRET.
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? "__Secure-" : ""}authjs.session-token`,
      options: {
        domain: useSecureCookies ? ".4hope.app" : undefined,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
      },
    },
  },
  callbacks: {
    async jwt({ token, account }) {
      // account.providerAccountId is Google's stable "sub" claim — use it as
      // the Firestore users/{uid} doc id so it never changes across sessions.
      if (account?.providerAccountId) token.uid = account.providerAccountId;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) session.user.id = token.uid as string;
      return session;
    },
  },
});
