import { describe, expect, test } from "vitest"
import { render, screen, fireEvent, getAllByRole } from "solid-testing-library"
import "@testing-library/jest-dom"
import { useCentralStore } from "../store"
import CentralStoreContext from "../CentralStoreContext"
import { createContext } from "solid-js"
import { TransactionView } from "./TransactionView"

test("the add transaction button causes the form to pop up", () => {
  const store = createCentralStore();
  render(() => (
    <CentralStoreContext.Provider value={store}>
      <TransactionView />
    </CentralStoreContext.Provider>
  ));
  const button = screen.getByRole("button", { name: "Add transaction" });
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  const form = screen.getByRole("form", { name: "Edit Transaction" });
  expect(form).toBeInTheDocument();

  /* const cancelButton = screen.getByRole("button", { name: "Cancel" })
   * fireEvent.click(cancelButton)
   * expect(form).not.toBeInTheDocument() */
});

test("submitting a new transaction form causes a new row to appear", async () => {
  const store = createCentralStore();
  render(() => (
    <CentralStoreContext.Provider value={store}>
      <TransactionView />
    </CentralStoreContext.Provider>
  ));
  fireEvent.click(screen.getByRole("button", { name: "Add transaction" }));
  const form = screen.getByRole("form", { name: "Edit Transaction" });
  const input = screen.getByRole<HTMLInputElement>("textbox", {
    name: "outflow",
  });
  fireEvent.submit(form);
  await new Promise((done) => setTimeout(done, 0));
  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(2);
});
