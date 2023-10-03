import { lucia } from "lucia"
import { web } from "lucia/middleware"
import { prisma } from "@lucia-auth/adapter-prisma"
import { PrismaClient } from "@prisma/client"
import { google } from "@lucia-auth/oauth/providers"

const client = new PrismaClient()

export const auth = lucia({
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: web(),
  sessionCookie: {
    expires: false,
  },

  getUserAttributes: (data) => ({
    email: data.email,
    oathUsername: data.username,
    emailVerified: data.emailVerified,
  }),

  adapter: prisma(client),
})

export const googleAuth = google(auth, {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: "http://localhost:3000/auth/callback/google",
  scope: ["email"],
})

export type Auth = typeof auth
