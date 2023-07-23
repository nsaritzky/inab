import { plaidClient } from "~/server/plaidApi"
import {
  type Transaction as PlaidTransaction,
  type RemovedTransaction,
} from "plaid"
import { Prisma, PlaidItem, type Transaction } from "@prisma/client"
import server$ from "solid-start/server"
import { addTransactions, updateCursor } from "~/db"

export const bankAccountSync = async (
  access_token: string,
  cursor?: string
) => {
  let nextCursor = cursor
  let added: PlaidTransaction[] = []
  let modified: PlaidTransaction[] = []
  let removed: RemovedTransaction[] = []
  let hasMore = true
  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token,
      cursor: nextCursor,
    })
    const data = response.data
    added = added.concat(data.added)
    modified = modified.concat(data.modified)
    removed = removed.concat(data.removed)

    hasMore = data.has_more
    nextCursor = data.next_cursor
  }
  return { added, modified, removed, nextCursor }
}

export const mapTransaction = (userID: string) => (txn: PlaidTransaction) =>
  ({
    amount: -1 * txn.amount,
    payee: txn.merchant_name || txn.name,
    description: null,
    date: txn.authorized_date
      ? new Date(txn.authorized_date)
      : new Date(txn.date),
    user: {
      connect: {
        id: userID,
      },
    },
    bankAccount: {
      connect: {
        plaidId: txn.account_id,
      },
    },
    plaidID: txn.transaction_id,
  } satisfies Prisma.TransactionCreateInput)

export const syncTransactions = async ({
  id: itemId,
  accessToken,
  userId,
  cursor,
}: PlaidItem) => {
  const { added, modified, removed, nextCursor } = await bankAccountSync(
    accessToken,
    cursor || undefined
  )
  await updateCursor(itemId, nextCursor!)
  await addTransactions(added.map(mapTransaction(userId)))
}
