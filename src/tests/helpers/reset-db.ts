import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async () =>
  await prisma.$transaction([
    prisma.account.deleteMany({}),
    prisma.allocated.deleteMany({}),
    prisma.bankAccount.deleteMany({}),
    prisma.emailVerification.deleteMany({}),
    prisma.envelope.deleteMany({}),
    prisma.goal.deleteMany({}),
    prisma.key.deleteMany({}),
    prisma.passwordReset.deleteMany({}),
    prisma.payee.deleteMany({}),
    prisma.plaidItem.deleteMany({}),
    prisma.session.deleteMany({}),
    prisma.transaction.deleteMany({}),
    prisma.user.deleteMany({}),
  ])
