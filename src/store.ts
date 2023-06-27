import { createStore } from "solid-js/store"
import type { Store, Transaction, Month, MonthYear, Panel } from "./types"
import { v4 as uuid } from "uuid"
import { createEffect, createMemo } from "solid-js"
import { dateToMonthYear } from "./utilities"

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
  currentMonth: "JUN 2023",
  unallocated: 0,
  envelopes: {
    Rent: { allocated: { "JUN 2023": 1000 } },
    Groceries: { allocated: { "JUN 2023": 300 } },
  },
  panel: "transactions",
}

export const createCentralStore = () => {
  const [state, setState] = createStore(initialState)

  const addTransaction = (
    idFn: () => string,
    {
      amount,
      date,
      payee,
      envelope,
      account,
      description,
    }: Omit<Transaction, "id">
  ) => {
    if (amount > 0) {
      setState("unallocated", (old) => old + amount)
    }
    setState("transactions", (txns) => [
      ...txns,
      { id: idFn(), amount, date, payee, envelope, account, description },
    ])
    if (!Object.keys(state.envelopes).includes(envelope)) {
      setState("envelopes", envelope, { allocated: {} })
    }
  }

  const deleteTransaction = (id: string) =>
    setState("transactions", (txns) => txns.filter((t) => t.id != id))

  const envelopeBalances = createMemo(() => {
    const result: Record<string, number> = {}
    for (const nm of Object.keys(state.envelopes)) {
      const activity = state.transactions
        .filter(
          (txn) =>
            txn.envelope == nm &&
            dateToMonthYear(txn.date) == state.currentMonth
        )
        .reduce((sum, txn) => sum + txn.amount, 0)
      Object.assign(result, { [nm]: activity })
    }
    return result
  })

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

  const nextMonth = (month: Month): Month => {
    switch (month) {
      case "JAN":
        return "FEB"
      case "FEB":
        return "MAR"
      case "MAR":
        return "APR"
      case "APR":
        return "MAY"
      case "MAY":
        return "JUN"
      case "JUN":
        return "JUL"
      case "JUL":
        return "AUG"
      case "AUG":
        return "SEP"
      case "SEP":
        return "OCT"
      case "OCT":
        return "NOV"
      case "NOV":
        return "DEC"
      case "DEC":
        return "JAN"
    }
  }

  const prevMonth = (month: Month): Month => {
    switch (month) {
      case "JAN":
        return "DEC"
      case "FEB":
        return "JAN"
      case "MAR":
        return "FEB"
      case "APR":
        return "MAR"
      case "MAY":
        return "APR"
      case "JUN":
        return "MAY"
      case "JUL":
        return "JUN"
      case "AUG":
        return "JUL"
      case "SEP":
        return "AUG"
      case "OCT":
        return "SEP"
      case "NOV":
        return "OCT"
      case "DEC":
        return "NOV"
    }
  }

  const incMonth = (my: MonthYear): MonthYear => {
    const month = my.slice(0, 3) as Month
    const year = parseInt(my.slice(-4))
    let newYear
    if (month == "DEC") {
      newYear = year + 1
    } else {
      newYear = year
    }
    return `${nextMonth(month)} ${newYear}`
  }

  const decMonth = (my: MonthYear): MonthYear => {
    const month = my.slice(0, 3) as Month
    const year = parseInt(my.slice(-4))
    let newYear
    if (month == "JAN") {
      newYear = year - 1
    } else {
      newYear = year
    }
    return `${prevMonth(month)} ${newYear}`
  }

  const setIncMonth = () => setState("currentMonth", incMonth)
  const setDecMonth = () => setState("currentMonth", decMonth)

  const setPanel = (panel: Panel) => setState("panel", panel)

  return [
    state,
    {
      addTransaction,
      deleteTransaction,
      envelopeBalances,
      accountBalances,
      setIncMonth,
      setDecMonth,
      setPanel,
    },
  ] as const
}
