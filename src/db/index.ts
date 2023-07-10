import { PrismaClient, Prisma, Envelope } from "@prisma/client";
import { createServerAction$, createServerData$ } from "solid-start/server";
import type { Transaction } from "@prisma/client";
import type { Optional } from "~/utilities";
import { endOfMonth } from "date-fns";

const db = new PrismaClient();

export const getTransactions = async () => await db.transaction.findMany();

export const getEnvelopes = () =>
  createServerData$(async () => {
    return await db.envelope.findMany();
  });

export const envelopeSums = async (month: number, year: number) => {
  const startOfMonth = new Date(`${year}-${month}-01`);
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
  });
};

export const getGoals = () =>
  createServerData$(async () => {
    return await db.goal.findMany();
  });

export const saveTransactionFn = async (txn: Optional<Transaction, "id">) => {
  if (txn.id) {
    await db.transaction.update({ where: { id: txn.id }, data: txn });
  } else await db.transaction.create({ data: txn });
};

export const updateTransactionFn = async (txn: Transaction) => {
  await db.transaction.update({ where: { id: txn.id }, data: txn });
};

export const deleteTransaction = async (txn: Transaction) => {
  await db.transaction.delete({ where: { id: txn.id } });
};
