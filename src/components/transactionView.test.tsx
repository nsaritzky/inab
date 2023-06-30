import { describe, expect, test } from "vitest"
import { render, screen, fireEvent } from "solid-testing-library"
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
