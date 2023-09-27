import { lucia } from "lucia"
import { web } from "lucia/middleware"
import { prisma } from "@lucia-auth/adapter-prisma"
import { PrismaClient } from "@prisma/client"

const client = new PrismaClient()

export const auth = lucia({
  env: process.env.NODE_ENV === "production" ? "PROD" : "DEV",
  middleware: web(),
  sessionCookie: {
    expires: false,
  },

  getUserAttributes: (data) => ({
    email: data.email,
  }),

  adapter: prisma(client),
})

export type Auth = typeof auth
