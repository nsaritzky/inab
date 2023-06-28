import { afterAll, beforeEach, describe, expect, test, vi } from "vitest"
import type { Transaction } from "./types"
import * as store from "./store"
import { createStore } from "solid-js/store"
import { createRoot } from "solid-js"

const sampleTxns = [
  {
    description: "test",
    amount: -1,
    payee: "BuyMart",
    envelope: "Groceries",
    account: "Checking",
    date: new Date(Date.parse("2023-06-28")),
  },
  {
    description: "another test",
    amount: -2,
    payee: "Scrooge McDuck",
    envelope: "Rent",
    account: "Checking",
    date: new Date(Date.parse("2023-06-30")),
  },
  {
    description: "another another test",
    amount: -10,
    payee: "Mr. F",
    envelope: "New",
    account: "Checking",
    date: new Date(Date.parse("2023-06-23")),
  },
  {
    description: "credit",
    amount: 10,
    payee: "",
    envelope: "",
    account: "Checking",
    date: new Date(Date.parse("2023-06-25")),
  },
]

const [dispose, state, fns] = createRoot((dispose) => {
  const [state, fns] = store.createCentralStore()
  return [dispose, state, fns]
})

let id = -1

const idFn = () => {
  id++
  return id.toString()
}

afterAll(dispose)

test("addTransaction", async () => {
  for (const txn of sampleTxns) {
    fns.addTransaction(idFn, txn)
  }

  await new Promise((done) => setTimeout(done, 0))
  // expect(state.transactions.length).toBe(4)
  // expect(Object.keys(state.envelopes)).toContain("New")
  // expect(state.envelopes["New"].allocated).toStrictEqual({})
  // expect(state.unallocated).toBe(10)
  expect(state).toMatchSnapshot()
})

describe("balances", () => {
  test("envelopeBalances", async () => {
    expect(fns.envelopeBalances()["Groceries"]).toBe(-1)
    expect(fns.envelopeBalances()["New"]).toBe(-10)
  })

  test.todo("accountBalances", () => {})
})

test("increment and decrement month", async () => {
  fns.setIncMonth()
  expect(state.currentMonth).toBe("JUL 2023")
  fns.setIncMonth()
  fns.setIncMonth()
  fns.setIncMonth()
  fns.setIncMonth()
  fns.setIncMonth()
  fns.setIncMonth()
  expect(state.currentMonth).toBe("JAN 2024")
  fns.setDecMonth()
  expect(state.currentMonth).toBe("DEC 2023")
  fns.setDecMonth()
  expect(state.currentMonth).toBe("NOV 2023")
})

test("deleteTransaction", async () => {
  fns.deleteTransaction("0")
  expect(state.transactions.length).toBe(3)
  expect(fns.envelopeBalances()["Rent"]).toBe(0)
})
