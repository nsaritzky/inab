import { expect, test } from "vitest"
import { render, screen, fireEvent, within } from "@solidjs/testing-library"
import userEvent from "@testing-library/user-event"
import BudgetView from "./BudgetView"
import "@testing-library/jest-dom"
import { useCentralStore } from "../store"
import CentralStoreContext from "~/CentralStoreContext"
import type { BudgetRouteData } from "~/routes/budget"
import type { JSX } from "solid-js"
import { Router } from "@solidjs/router"

Object.defineProperty(import.meta, "hot", { value: { data: {} } })

type Ui = () => JSX.Element
const renderWrapped = (ui: Ui) =>
  render(ui, { wrapper: (props) => <Router>{props.children}</Router> })
const testData: BudgetRouteData = {
  transactions: [],
  envelopes: [
    {
      name: "test1",
      userID: "1",
      goals: [],
      allocated: [
        { monthIndex: 1, amount: 100, envelopeName: "test1", userID: "1" },
        { monthIndex: 2, amount: 50, envelopeName: "test1", userID: "1" },
      ],
    },
    { name: "test2", userID: "1", goals: [], allocated: [] },
  ],
  user: {
    name: "Nathan",
    emailVerified: null,
    image: null,
    plaidItems: [],
    id: "1",
    email: "email@address.com",
  },
}

beforeEach(() => {
  renderWrapped(() => {
    const ctx = useCentralStore()
    const [_, { setMonth }] = ctx
    setMonth(1)
    return (
      <CentralStoreContext.Provider value={ctx}>
        <BudgetView rawData={testData} />
      </CentralStoreContext.Provider>
    )
  })
})

describe("Clicking on a row...", () => {
  test("...causes a textbox to appear within it and focuses it", async () => {
    const rows = screen.getAllByRole("row")
    await userEvent.click(rows[1])
    const input = screen.getByRole("textbox")
    expect(rows[1]).toContainElement(input)
    expect(input).toHaveFocus()
  })

  test("...but not within other rows", () => {
    const rows = screen.getAllByRole("row")
    fireEvent.click(rows[2])
    const input = screen.getByRole("textbox")
    expect(rows[1]).not.toContainElement(input)
  })
})

test("Allocated value should match db value", () => {
  const rows = screen.getAllByRole("row")
  const cell = rows[1].children[1]
  expect(cell).toHaveTextContent("$100.00")
})

test("Clicking on a row highlights it", async () => {
  const rows = screen.getAllByRole("row")
  await userEvent.click(rows[1])
  expect(rows[1]).toHaveClass("bg-sky-200")
  expect(rows[2]).not.toHaveClass("bg-sky-200")
})

test.skip("The increment and decrement month buttons work", async () => {
  const prevMonth = screen.getByRole("button", { name: "previous month" })
  await userEvent.click(prevMonth)
  const currMonth = screen.getByRole("button", { name: "JAN 2023" })
  expect(currMonth)
  const rows = screen.getAllByRole("row")
  const cell = rows[1].children[1]
  expect(cell).toHaveTextContent("$0.00")

  const nextMonth = screen.getByRole("button", { name: "next month" })
  await userEvent.click(nextMonth)
  await userEvent.click(nextMonth)
  expect(currMonth).toHaveTextContent("MAR 2023")
  expect(cell).toHaveTextContent("$50.00")
})
