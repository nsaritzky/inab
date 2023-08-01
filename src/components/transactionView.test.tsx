import { describe, expect, test } from "vitest"
import { render, screen, fireEvent, getAllByRole } from "solid-testing-library"
import "@testing-library/jest-dom"
import { useCentralStore } from "../store"
import CentralStoreContext from "../CentralStoreContext"
import { createContext } from "solid-js"
import { TransactionView } from "./TransactionView"

test("the add transaction button causes the form to pop up", async () => {
  const store = useCentralStore()
  render(() => (
    <CentralStoreContext.Provider value={store}>
      <TransactionView
        rawData={{
          transactions: [],
          userId: "user-id",
          envelopes: [],
          accountNames: [],
        }}
      />
    </CentralStoreContext.Provider>
  ))
  screen.debug()
  /* const button = await screen.findByRole("button", { name: "Add transaction" })
  * expect(button).toBeInTheDocument()

  * fireEvent.click(button)
  * const form = screen.getByRole("form", { name: "Edit Transaction" })
  * expect(form).toBeInTheDocument()

  * const cancelButton = screen.getByRole("button", { name: "Cancel" })
  * fireEvent.click(cancelButton)
  * expect(form).not.toBeInTheDocument() */
})

test.skip("submitting a new transaction form causes a new row to appear", async () => {
  const store = useCentralStore()
  render(() => (
    <CentralStoreContext.Provider value={store}>
      <TransactionView
        rawData={{
          transactions: [],
          userId: "user-id",
          envelopes: [],
          accountNames: [],
        }}
      />
    </CentralStoreContext.Provider>
  ))
  const addButton = await screen.findByRole("button", {
    name: "Add transaction",
  })
  fireEvent.click(addButton)
  const form = screen.getByRole("form", { name: "Edit Transaction" })
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "outflow",
  })
  fireEvent.submit(form)
  await new Promise((done) => setTimeout(done, 0))
  const rows = screen.getAllByRole("row")
  expect(rows.length).toBe(2)
})
