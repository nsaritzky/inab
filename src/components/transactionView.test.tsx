import { describe, expect, test } from "vitest"
import { render, screen, fireEvent, getAllByRole } from "solid-testing-library"
import { TransactionView } from "./transactionView"
import "@testing-library/jest-dom"

test("the add transaction button causes the form to pop up", () => {
  render(() => <TransactionView />)

  const button = screen.getByRole("button", { name: "Add transaction" })
  expect(button).toBeInTheDocument()

  fireEvent.click(button)
  const form = screen.getByRole("form", { name: "Edit Transaction" })
  expect(form).toBeInTheDocument()

  /* const cancelButton = screen.getByRole("button", { name: "Cancel" })
   * fireEvent.click(cancelButton)
   * expect(form).not.toBeInTheDocument() */
})

test("submitting a new transaction form causes a new row to appear", async () => {
  render(() => <TransactionView />)

  fireEvent.click(screen.getByRole("button", { name: "Add transaction" }))
  const form = screen.getByRole("form", { name: "Edit Transaction" })
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "outflow",
  })
  fireEvent.submit(form)
  await new Promise((done) => setTimeout(done, 0))
  const rows = screen.getAllByRole("row")
  expect(rows.length).toBe(2)
})
