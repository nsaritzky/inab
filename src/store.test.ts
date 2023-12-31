import { afterAll, beforeEach, describe, expect, test, vi } from "vitest"
import type { Transaction } from "./types"
import * as store from "./store"
import { createStore } from "solid-js/store"
import { createRoot } from "solid-js"

const sampleTxns = [
  {
    description: "test",
    outflow: 1,
    inflow: 0,
    payee: "BuyMart",
    envelope: "Groceries",
    account: "Checking",
    date: new Date(Date.parse("2023-06-28")),
  },
  {
    description: "another test",
    outflow: 2,
    inflow: 0,
    payee: "Scrooge McDuck",
    envelope: "Rent",
    account: "Checking",
    date: new Date(Date.parse("2023-06-30")),
  },
  {
    description: "another another test",
    outflow: 10,
    inflow: 0,
    payee: "Mr. F",
    envelope: "New",
    account: "Checking",
    date: new Date(Date.parse("2023-06-23")),
  },
  {
    description: "credit",
    outflow: 0,
    inflow: 10,
    payee: "",
    envelope: "",
    account: "Checking",
    date: new Date(Date.parse("2023-06-25")),
  },
  {
    description: "another test",
    outflow: 2,
    inflow: 0,
    payee: "Scrooge McDuck",
    envelope: "Rent",
    account: "Checking",
    date: new Date(Date.parse("2023-07-30")),
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
    expect(fns.envelopeBalances()["Rent"]).toBe(-2)
    expect(fns.envelopeBalances()["New"]).toBe(-10)
  })

  test("monthlyBalances", () => {
    expect(fns.monthlyBalances()["Groceries"][5]).toBe(299)
    expect(fns.monthlyBalances()["Rent"][5]).toBe(998)
    expect(fns.monthlyBalances()["New"][5]).toBe(-10)
  })

  test("netBalance", () => {
    expect(fns.netBalance()["Rent"][6]).toBe(996)
  })
})

test("editTransaction", () => {
  fns.editTransaction("2", {
    description: "editing test",
    outflow: 5,
    inflow: 0,
    payee: "Mr. F",
    envelope: "New",
    account: "Checking",
    date: new Date(Date.parse("2023-06-23")),
  })
  expect(state.transactions["2"].amount).toBe(-5)
  expect(state.transactions["2"].description).toBe("editing test")
  expect(state.transactions["2"].payee).toBe("Mr. F")
})

test("deleteTransaction", async () => {
  fns.deleteTransaction("1")
  expect(state.transactions.length).toBe(4)
  expect(fns.envelopeBalances()["Rent"]).toBe(0)
})
