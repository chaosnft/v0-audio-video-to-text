// types/next-auth.d.ts (New file)
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscription?: string
    } & DefaultSession["user"]
  }

  interface User {
    subscription?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    subscription?: string
  }
}