import { PrismaClient, Prisma, Envelope, Goal } from "@prisma/client"
import { createServerAction$, createServerData$ } from "solid-start/server"
import type { Transaction } from "@prisma/client"
import type { Optional } from "~/utilities"
import { endOfMonth } from "date-fns"

const db = new PrismaClient()

export const getTransactions = async () => await db.transaction.findMany()

export const getEnvelopes = async () => {
  const es = await db.envelope.findMany({
    include: { goals: true, allocated: true },
  })
  return es
}

export const envelopeSums = async (month: number, year: number) => {
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
      ],
    },
  })
}

export const getGoals = () =>
  createServerData$(async () => {
    return await db.goal.findMany()
  })

export const setAllocation = async (
  envelopeName: string,
  monthIndex: number,
  amount: number
) => {
  await db.allocated.upsert({
    where: {
      monthIndex_envelopeName: { monthIndex, envelopeName },
    },
    create: {
      monthIndex,
      amount,
      Envelope: {
        connect: { name: envelopeName },
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
  } else await db.transaction.create({ data: { ...txn, id: undefined } })
}

export const updateTransactionFn = async (txn: Transaction) => {
  await db.transaction.update({ where: { id: txn.id }, data: txn })
}

export const deleteTransaction = async (txn: Transaction) => {
  await db.transaction.delete({ where: { id: txn.id } })
}

export const updateGoalFn = async (goal: Goal) => {
  await db.goal.upsert({
    where: {
      envelopeName: goal.envelopeName,
    },
    create: goal,
    update: goal,
  })
  console.log(goal)
}

export const deleteGoalFn = async (envelopeName: string) => {
  await db.goal.delete({ where: { envelopeName } })
}
