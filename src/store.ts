import { createStore } from "solid-js/store"
import type { Store, Transaction, Month, MonthYear, Panel } from "./types"
import { v4 as uuid } from "uuid"
import { createEffect, createMemo } from "solid-js"
import { dateToMonthYear } from "./utilities"

export const DAY_ONE = new Date("2023-01-01T00:00:01")
const ZEROS: number[] = Array(50).fill(0)

const sampleTxns: Transaction[] = [
  {
    id: "0",
    description: "test",
    amount: -1,
    payee: "BuyMart",
    envelope: "Groceries",
    account: "Checking",
    date: new Date(),
  },
  {
    id: "1",
    description: "another test",
    amount: -2,
    payee: "Scrooge McDuck",
    envelope: "Rent",
    account: "Checking",
    date: new Date(),
  },
]
export const initialState: Store = {
  transactions: [],
  accounts: [],
  currentMonth: 5,
  unallocated: 0,
  envelopes: {
    Rent: {
      allocated: [0, 0, 0, 0, 0, 1000].concat(ZEROS),
      monthlyGoal: ZEROS,
    },
    Groceries: {
      allocated: [0, 0, 0, 0, 0, 300].concat(ZEROS),
      monthlyGoal: ZEROS,
    },
  },
  panel: "transactions",
}

export const createCentralStore = () => {
  const [state, setState] = createStore(initialState)

  const addTransaction = (
    idFn: () => string,
    {
      inflow,
      outflow,
      date,
      payee,
      envelope,
      account,
      description,
    }: Omit<Transaction, "id" | "amount"> & { inflow: number; outflow: number }
  ) => {
    const amount = inflow - outflow
    if (amount > 0) {
      setState("unallocated", (old) => old + amount)
    }
    setState("transactions", (txns) => [
      ...txns,
      { id: idFn(), amount, date, payee, envelope, account, description },
    ])
    if (!Object.keys(state.envelopes).includes(envelope)) {
      setState("envelopes", envelope, { allocated: ZEROS, monthlyGoal: ZEROS })
    }
  }

  const deleteTransaction = (id: string) =>
    setState("transactions", (txns) => txns.filter((t) => t.id != id))

  const allocate = (envelope: string, month: number, value: number) => {
    const oldValue: number = state.envelopes[envelope].allocated[month] || 0
    setState("envelopes", envelope, "allocated", month, value)
    setState("unallocated", (old) => old - value + oldValue)
  }

  const envelopeBalances = createMemo(() => {
    const result: Record<string, number> = {}
    for (const nm of Object.keys(state.envelopes)) {
      const activity = state.transactions
        .filter(
          (txn) =>
            txn.envelope == nm && dateToIndex(txn.date) == state.currentMonth
        )
        .reduce((sum, txn) => sum + txn.amount, 0)
      Object.assign(result, { [nm]: activity })
    }
    return result
  })

  const monthlyBalances = createMemo(() =>
    Object.fromEntries(
      Object.entries(state.envelopes).map(([nm, envlp]) => [
        nm,
        envlp.allocated.map(
          (x, i) =>
            x +
            state.transactions
              .filter((txn) => dateToIndex(txn.date) == i && txn.envelope == nm)
              .reduce((sum, txn) => sum + txn.amount, 0)
        ),
      ])
    )
  )

  const netBalance = createMemo(() =>
    Object.fromEntries(
      Object.entries(monthlyBalances()).map(([nm, balances]) => [
        nm,
        balances.map((_, i) =>
          balances.slice(0, i + 1).reduce((a, b) => a + b, 0)
        ),
      ])
    )
  )

  const accountBalances = createMemo(() => {
    const result: Record<string, number> = {}
    for (const nm of state.accounts) {
      const spent = state.transactions
        .filter((txn) => txn.account == nm)
        .reduce((sum, txn) => sum + txn.amount, 0)
      Object.assign(result, { [nm]: spent })
    }
    return result
  })

  const dateToIndex = (d: Date) =>
    12 * d.getFullYear() +
    d.getMonth() -
    12 * DAY_ONE.getFullYear() -
    DAY_ONE.getMonth()

  const setIncMonth = () => setState("currentMonth", (n) => n + 1)
  const setDecMonth = () => setState("currentMonth", (n) => n - 1)

  const setPanel = (panel: Panel) => setState("panel", panel)

  return [
    state,
    {
      allocate,
      addTransaction,
      deleteTransaction,
      envelopeBalances,
      monthlyBalances,
      netBalance,
      accountBalances,
      setIncMonth,
      setDecMonth,
      setPanel,
      dateToIndex,
    },
  ] as const
}
