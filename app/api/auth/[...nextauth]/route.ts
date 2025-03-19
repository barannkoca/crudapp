import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    /*GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }), */
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error", // hata sayfası
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8, // 8 saat
    updateAge: 60 * 60 * 4, // 4 saatte bir güncellenir
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// GET ve POST metodları için named exports
export const GET = NextAuth(authOptions);
export const POST = NextAuth(authOptions);