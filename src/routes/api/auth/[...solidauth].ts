// routes/api/auth/[...solidauth].ts
import { SolidAuth, type SolidAuthConfig } from "@solid-auth/base"
import Google from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOpts: SolidAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: false,
}

export const { GET, POST } = SolidAuth(authOpts)
