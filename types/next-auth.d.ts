import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    corporate?: string;
  }

  interface Session {
    user: User & {
      id: string;
      corporate?: string;
    };
  }
} 