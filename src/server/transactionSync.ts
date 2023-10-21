import { plaidClient } from "~/server/plaidApi"
import {
  type Transaction as PlaidTransaction,
  type RemovedTransaction,
  PlaidError,
} from "plaid"
import { Prisma, PlaidItem, type Transaction } from "@prisma/client"
import { addTransactions, updateCursor, updateTransactions } from "~/db"

type Result<T, E> = { ok: true; content: T } | { ok: false; error: E }
interface AccountSyncReturn {
  nextCursor: string | undefined
  added: PlaidTransaction[]
  modified: PlaidTransaction[]
  removed: RemovedTransaction[]
}

export const bankAccountSync = async (
  access_token: string,
  itemId: string,
  cursor?: string,
) => {
  let nextCursor = cursor
  let added: PlaidTransaction[] = []
  let modified: PlaidTransaction[] = []
  let removed: RemovedTransaction[] = []
  let error = {}
  let hasMore = true
  while (hasMore) {
    try {
      const response = await plaidClient.transactionsSync({
        access_token,
        cursor: nextCursor,
      })
      console.log(response)
      const data = response.data
      added = added.concat(data.added)
      modified = modified.concat(data.modified)
      removed = removed.concat(data.removed)

      hasMore = data.has_more
      nextCursor = data.next_cursor
    } catch (err) {
      const data = err.response.data
      if (data.error_code === "ITEM_LOGIN_REQUIRED") {
        console.log("item login required")

        return "ITEM_LOGIN_REQUIRED"
      }
      hasMore = false
    }
  }
  return { added, modified, removed, nextCursor }
}

export const mapTransaction = (userID: string) => (txn: PlaidTransaction) =>
  ({
    amount: -1 * txn.amount,
    payee: txn.merchant_name || txn.name,
    description: null,
    source: "PLAID",
    pending: txn.pending,
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
  }) satisfies Prisma.TransactionCreateInput &
    Prisma.TransactionUpdateInput & { plaidID: string }

export const syncTransactions = async ({
  id: itemId,
  accessToken,
  userId,
  cursor,
}: PlaidItem) => {
  const result = await bankAccountSync(accessToken, itemId, cursor || undefined)
  if (result === "ITEM_LOGIN_REQUIRED") {
    return "ITEM_LOGIN_REQUIRED"
  } else {
    const { added, removed, modified, nextCursor } = result
    await updateCursor(itemId, nextCursor!)
    await addTransactions(added.map(mapTransaction(userId)))
    await updateTransactions(modified.map(mapTransaction(userId)))
  }
}
