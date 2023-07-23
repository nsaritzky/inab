import { PrismaClient, Prisma, Envelope, Goal } from "@prisma/client"
import { createServerAction$, createServerData$ } from "solid-start/server"
import type { Transaction } from "@prisma/client"
import type { Optional } from "~/utilities"
import { endOfMonth } from "date-fns"
import { AccountBase } from "plaid"

const db = new PrismaClient()

export const getUserFromEmail = async (email: string) =>
  await db.user.findUnique({
    where: { email },
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

export const envelopeSums = async (
  userEmail: string,
  month: number,
  year: number
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
  amount: number
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
  txn: Prisma.TransactionCreateInput & { id?: number }
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

export const addTransactions = async (
  txns: Prisma.TransactionCreateInput[]
) => {
  for (const txn of txns) {
    await db.transaction.create({ data: txn })
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

export const updateTransactionFn = async (txn: Transaction) => {
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

export const savePlaidItemFn = async (
  accessToken: string,
  itemId: string,
  userId: string,
  accts: AccountBase[]
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
