import { createStore } from "solid-js/store"
import type { Store, Transaction } from "./types"
import { v4 as uuid } from "uuid"
import { createEffect, createMemo } from "solid-js"

const sampleTxns: Transaction[] = [
  {
    id: "0",
    description: "test",
    amount: -1,
    envelope: "Groceries",
    account: "Checking",
    date: new Date(),
  },
  {
    id: "1",
    description: "another test",
    amount: -2,
    envelope: "Rent",
    account: "Checking",
    date: new Date(),
  },
]
export const [state, setState] = createStore<Store>({
  transactions: sampleTxns,
  accounts: [],
  envelopes: { Rent: { allocated: 1000 }, Groceries: { allocated: 300 } },
  panel: "transactions",
})

export const addTransaction = ({
  amount,
  date,
  envelope,
  account,
  description,
}: Omit<Transaction, "id">) => {
  console.log(description)
  setState("transactions", (txns) => [
    ...txns,
    { id: uuid(), amount, date, envelope, account, description },
  ])
  if (!Object.keys(state.envelopes).includes(envelope)) {
    setState("envelopes", envelope, { allocated: 0 })
  }
}

export const deleteTransaction = (id: string) =>
  setState("transactions", (txns) => txns.filter((t) => t.id != id))

export const envelopeBalances = createMemo(() => {
  const result: Record<string, number> = {}
  for (const nm of Object.keys(state.envelopes)) {
    const activity = state.transactions
      .filter((txn) => txn.envelope == nm)
      .reduce((sum, txn) => sum + txn.amount, 0)
    Object.assign(result, { [nm]: activity })
  }
  return result
})

export const accountBalances = createMemo(() => {
  const result: Record<string, number> = {}
  for (const nm of state.accounts) {
    const spent = state.transactions
      .filter((txn) => txn.account == nm)
      .reduce((sum, txn) => sum + txn.amount, 0)
    Object.assign(result, { [nm]: spent })
  }
  return result
})
