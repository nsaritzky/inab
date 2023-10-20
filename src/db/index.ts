import { PrismaClient, Prisma, Envelope, Goal } from "@prisma/client"
import { createServerAction$, createServerData$ } from "solid-start/server"
import type { Transaction } from "@prisma/client"
import type { Optional } from "~/utilities"
import { endOfMonth } from "date-fns"
import { AccountBase } from "plaid"

const db = new PrismaClient()

export const getUserByEmail = async (email: string) =>
  await db.user.findUnique({
    where: { email },
    include: {
      plaidItems: true,
    },
  })

export const getUserById = async (userId: string) =>
  await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      plaidItems: true,
    },
  })

export const getTransactions = async (userID: string) =>
  await db.transaction.findMany({
    where: {
      userID,
    },
    include: {
      bankAccount: true,
    },
  })

export type TransactionsReturn = Awaited<
  ReturnType<typeof getTransactions>
>[number]

export const getEnvelopes = async (userID: string) =>
  await db.envelope.findMany({
    where: { userID },
  })

export const getEnvelopesWithGoals = async (userID: string) => {
  const es = await db.envelope.findMany({
    include: { goals: true, allocated: true },
    where: {
      userID,
    },
  })
  return es
}

export const getEmailVerificationToken = async (token: string) => {
  return await db.emailVerification.findUniqueOrThrow({
    where: {
      id: token,
    },
  })
}

export const getAndThenDeleteVerificationToken = async (token: string) =>
  await db.$transaction(async (tx) => {
    const storedToken = await tx.emailVerification.findUniqueOrThrow({
      where: {
        id: token,
      },
    })
    await tx.emailVerification.deleteMany({
      where: {
        userId: storedToken.userId,
      },
    })
    return storedToken
  })

export const deleteEmailVerificationTokens = async (userId: string) => {
  await db.emailVerification.deleteMany({
    where: {
      userId,
    },
  })
}

export const getEmailVerificationTokens = async (userId: string) => {
  return await db.emailVerification.findMany({
    where: {
      userId,
    },
  })
}

export const saveEmailVerificationToken = async (
  userId: string,
  token: string,
  expiresIn: number,
) => {
  await db.emailVerification.create({
    data: {
      id: token,
      userId,
      expires: new Date(Date.now() + expiresIn),
    },
  })
}

export const getPasswordResetTokens = async (userId: string) => {
  return await db.passwordReset.findMany({
    where: {
      userId,
    },
  })
}

export const savePasswordResetToken = async (
  token: string,
  expires: number,
  userId: string,
) => {
  console.log(`saving token`)
  await db.passwordReset.create({
    data: {
      id: token,
      expires,
      userId,
    },
  })
}

export const retrievePasswordResetToken = async (token: string) => {
  const storedToken = db.passwordReset.findUniqueOrThrow({
    where: {
      id: token,
    },
  })
  db.passwordReset.delete({
    where: {
      id: token,
    },
  })
  return storedToken
}

export const verifyEmailToken = async (userId: string, token: string) => {
  db.$transaction([
    db.emailVerification.findUnique({
      where: {
        id: token,
      },
    }),
    db.emailVerification.deleteMany({
      where: {
        userId,
      },
    }),
  ])
}

export const envelopeSums = async (
  userEmail: string,
  month: number,
  year: number,
) => {
  const startOfMonth = new Date(`${year}-${month}-01`)
  await db.transaction.groupBy({
    by: ["envelopeName"],
    _sum: {
      amount: true,
    },
    where: {
      AND: [
        {
          date: {
            gte: startOfMonth,
          },
        },
        {
          date: {
            lte: endOfMonth(startOfMonth),
          },
        },
        {
          user: {
            is: {
              email: userEmail,
            },
          },
        },
      ],
    },
  })
}

export const getGoals = (userEmail: string) =>
  createServerData$(async () => {
    return await db.goal.findMany({
      where: {
        user: {
          is: {
            email: userEmail,
          },
        },
      },
    })
  })

export const setAllocation = async (
  userID: string,
  envelopeName: string,
  monthIndex: number,
  amount: number,
) => {
  await db.allocated.upsert({
    where: {
      monthIndex_envelopeName_userID: { monthIndex, envelopeName, userID },
    },
    create: {
      monthIndex,
      amount,
      Envelope: {
        connect: { name_userID: { name: envelopeName, userID } },
      },
      user: {
        connect: {
          id: userID,
        },
      },
    },
    update: {
      amount,
    },
  })
}

export const saveTransactionFn = async (
  txn:
    | Prisma.TransactionCreateInput
    | (Prisma.TransactionUpdateInput & { id: number }),
) => {
  if (txn.id) {
    await db.transaction.update({
      where: { id: txn.id },
      data: { ...txn, id: undefined },
    })
  } else
    await db.transaction.create({
      data: { ...txn, id: undefined },
      include: { envelope: true },
    })
}

export const saveNewTransactionFn = async (
  txn: Prisma.TransactionCreateInput,
) => {
  await db.transaction.create({ data: { ...txn }, include: { envelope: true } })
}

export const editTransactionFn = async (
  txn: Prisma.TransactionUpdateInput & { id: number },
) => {
  await db.transaction.update({
    where: { id: txn.id },
    data: { ...txn, id: undefined },
  })
}

export const addTransactions = async (
  txns: Prisma.TransactionCreateInput[],
) => {
  for (const txn of txns) {
    await db.transaction.create({
      data: txn,
    })
  }
}

export const updateTransactions = async (
  txns: (Prisma.TransactionUpdateInput & { plaidID: string })[],
) => {
  for (const txn of txns) {
    await db.transaction.update({
      data: txn,
      where: {
        plaidID: txn.plaidID,
      },
    })
  }
}

export const updateCursor = async (itemId: string, cursor: string) => {
  await db.plaidItem.update({
    where: {
      id: itemId,
    },
    data: {
      cursor,
    },
  })
}

export const updateTransactionFn = async (txn: {
  id: number
  amount: number
  envelopeName: string | undefined
  date: Date
  payee: string | undefined
  description: string | undefined
  bankAccountName: string
}) => {
  await db.transaction.update({ where: { id: txn.id }, data: txn })
}

export const deleteTransaction = async (txn: Transaction) => {
  console.log("deleting")
  await db.transaction.delete({ where: { id: txn.id } })
}

export const updateGoalFn = async (goal: Goal) => {
  console.log("updating goal")
  await db.goal.upsert({
    where: {
      envelopeName_userID: {
        envelopeName: goal.envelopeName,
        userID: goal.userID,
      },
    },
    create: goal,
    update: goal,
  })
  console.log(goal)
}

export const deleteGoalFn = async (envelopeName: string, userID: string) => {
  await db.goal.delete({
    where: { envelopeName_userID: { envelopeName, userID } },
  })
}

export const getAccessToken = async (accountId: string) => {
  const account = await db.plaidItem.findUnique({
    where: {
      id: accountId,
    },
  })
  return account?.accessToken
}

export const getAccountNames = async (userId: string) => {
  const accounts = await db.bankAccount.findMany({
    where: {
      userId,
    },
    select: {
      name: true,
    },
  })
  return accounts.map((acct) => acct.name)
}

export const getBankAccounts = async (userId: string) => {
  return await db.bankAccount.findMany({
    where: {
      userId,
    },
  })
}

export const setBankAccountName = async (
  id: number,
  userProvidedName: string,
) => {
  await db.bankAccount.update({
    where: {
      id,
    },
    data: {
      userProvidedName,
    },
  })
}

export const savePlaidItemFn = async (
  accessToken: string,
  itemId: string,
  userId: string,
  accts: AccountBase[],
) => {
  await db.$transaction([
    db.plaidItem.create({
      data: {
        id: itemId,
        accessToken,
        userId,
        bankAccounts: {
          create: accts.map((acct) => ({
            name: acct.name,
            plaidId: acct.account_id,
            user: {
              connect: {
                id: userId,
              },
            },
          })),
        },
      },
    }),
    db.plaidItem.update({
      where: {
        id: itemId,
      },
      data: {
        bankAccounts: {
          connect: accts.map((acct) => ({ plaidId: acct.account_id })),
        },
      },
    }),
  ])
}

// export const getPlaidItems = async (userId: string) =>
//   await db.user.findUnique({
//     where: {
//       id: userId,
//     },
//     include: {
//       plaidItems: true,
//     },
//   })
