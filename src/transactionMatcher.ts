import { Transaction } from "@prisma/client"
import { isAfter, min } from "date-fns"
import { mapPartial } from "./utilities"

export const findMatches = (txns: Transaction[]): Transaction[] => {
  const unlinkedPlaidTransactions = txns.filter(
    (txn) => txn.linked == false && txn.source == "plaid",
  )
  const findMatch =
    (ts: Transaction[]) =>
    (t: Transaction): Transaction | undefined => {
      const matches = ts.filter(
        (txn) => txn.date == t.date && txn.amount == t.amount,
      )
      return matches.length == 1 ? matches[0] : undefined
    }
  const recentDate = min(unlinkedPlaidTransactions.map((t) => t.date))
  const recentUserTransactions = txns.filter(
    (t) => isAfter(t.date, recentDate) && t.source == "user",
  )
  return mapPartial(
    unlinkedPlaidTransactions,
    findMatch(recentUserTransactions),
  )
}
