import { User } from "@prisma/client"

/// <reference types="lucia" />
declare global {
  namespace Lucia {
    type Auth = import("./auth/lucia").Auth
    type DatabaseUserAttributes = {
      email: string
      emailVerified: boolean
    }
    type DatabaseSessionAttributes = {}
  }
}

export {}
