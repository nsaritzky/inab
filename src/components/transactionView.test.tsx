import { describe, expect, test, vi } from "vitest"
import { render, screen, within } from "@solidjs/testing-library"
import "@testing-library/jest-dom"
import { useCentralStore } from "../store"
import CentralStoreContext from "../CentralStoreContext"
import { createContext } from "solid-js"
import { TransactionView } from "./TransactionView"
import { TransactionsReturn } from "~/db"
import { faker } from "@faker-js/faker"
import CentralStoreProvider from "./storeProvider"
import userEvent from "@testing-library/user-event"
import { Route, Routes } from "solid-start"
import { Router } from "@solidjs/router"
import { Checkbox } from "@kobalte/core"

const mockAccount = () => ({
  id: faker.number.int(),
  name: faker.company.name(),
  userProvidedName: faker.finance.accountName(),
  userId: faker.string.uuid(),
  plaidId: faker.number.int().toString(),
  plaidItemId: null,
  creditCard: false,
})

const mockAccounts = [...Array(5)].map(() => mockAccount())

const mockUser = () => ({
  plaidItems: [
    {
      id: faker.string.uuid(),
      accessToken: faker.string.alphanumeric(),
      userId: faker.string.uuid(),
      cursor: faker.string.alphanumeric(),
    },
  ],
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  emailVerified: true,
  image: null,
})

const mockTransaction = (): TransactionsReturn => ({
  id: faker.number.int(),
  amount: parseFloat(faker.finance.amount({ min: -1000 })),
  bankAccount: faker.helpers.arrayElement(mockAccounts),
  envelopeName: faker.string.alpha(),
  date: faker.date.past(),
  payee: faker.company.name(),
  description: faker.finance.transactionDescription(),
  userID: faker.string.uuid(),
  plaidID: faker.string.uuid(),
  bankAccountName: faker.finance.accountName(),
  source: faker.helpers.arrayElement(["plaid", "user"]),
  pending: faker.datatype.boolean(),
  linked: faker.datatype.boolean(),
})

const mockTransactions = (n: number): TransactionsReturn[] =>
  [...Array(n).keys()].map((_) => mockTransaction())

const mockData = (n: number) => ({
  transactions: mockTransactions(n),
  user: mockUser(),
  envelopes: [],
  bankAccounts: mockAccounts,
})

const renderTransactionView = (
  data: ReturnType<typeof mockData>,
  url: string = "/app/transactions",
) =>
  render(
    () => (
      <Router>
        <TransactionView rawData={data} />
      </Router>
    ),
    {
      location: url,
    },
  )

// test.skip("the add transaction button causes the form to pop up", async () => {
//   const store = useCentralStore()
//   render(() => (
//     <CentralStoreContext.Provider value={store}>
//       <TransactionView rawData={mockData()} />
//     </CentralStoreContext.Provider>
//   ))
//   screen.debug()
//   /* const button = await screen.findByRole("button", { name: "Add transaction" })
//   * expect(button).toBeInTheDocument()

//   * fireEvent.click(button)
//   * const form = screen.getByRole("form", { name: "Edit Transaction" })
//   * expect(form).toBeInTheDocument()

//   * const cancelButton = screen.getByRole("button", { name: "Cancel" })
//   * fireEvent.click(cancelButton)
//   * expect(form).not.toBeInTheDocument() */
// })

// test.skip("submitting a new transaction form causes a new row to appear", async () => {
//   const store = useCentralStore()
//   render(() => (
//     <CentralStoreContext.Provider value={store}>
//       <TransactionView
//         rawData={{
//           transactions: [],
//           user: mockUser(),
//           envelopes: [],
//           bankAccounts: [],
//         }}
//       />
//     </CentralStoreContext.Provider>
//   ))
//   const addButton = await screen.findByRole("button", {
//     name: "Add transaction",
//   })
//   fireEvent.click(addButton)
//   const form = screen.getByRole("form", { name: "Edit Transaction" })
//   const input = screen.getByRole<HTMLInputElement>("textbox", {
//     name: "outflow",
//   })
//   fireEvent.submit(form)
//   await new Promise((done) => setTimeout(done, 0))
//   const rows = screen.getAllByRole("row")
//   expect(rows.length).toBe(2)
// })

test("Clicking on a row opens editing", async () => {
  const user = userEvent.setup()
  render(
    () => (
      <Router>
        {" "}
        <TransactionView rawData={mockData(100)} />
      </Router>
    ),
    {
      location: "/app/transactions",
    },
  )
  const rows = await screen.findAllByRole("row")
  await user.click(rows[22])
  await screen.findAllByRole("textbox")
})

test("Hitting escape closes editing", async () => {
  const user = userEvent.setup()
  render(
    () => (
      <Router>
        {" "}
        <TransactionView rawData={mockData(100)} />
      </Router>
    ),
    {
      location: "/app/transactions",
    },
  )
  const rows = await screen.findAllByRole("row")
  await user.click(rows[22])
  const textbox = await screen.findAllByRole("textbox")
  await user.keyboard("{Escape}")
  expect(textbox[0]).not.toBeInTheDocument()
})

test("Opening and closing the filter bar works", async () => {
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  const filterButton = await screen.findByRole("button", { name: "Filter" })
  await user.click(filterButton)
  await user.click(
    await screen.findByRole("button", {
      name: "Close Filter Bar",
    }),
  )
  await screen.findByRole("button", { name: "Filter" })
})

test("Previous and next page buttons work", async () => {
  // jsdom doesn't have scrollIntoView, so we add it
  window.HTMLElement.prototype.scrollIntoView = function () {}
  faker.seed(1728)
  const user = userEvent.setup()
  const data = mockData(100)
  renderTransactionView(data)
  const cells = await screen.findAllByRole("gridcell")
  const nextPageButton = screen.getByRole("button", { name: "Next" })
  await user.click(nextPageButton)
  expect(cells[0]).not.toBeInTheDocument()
  const newCells = screen.getAllByRole("gridcell")
  await user.click(screen.getByRole("button", { name: "Prev" }))
  expect(newCells[0]).not.toBeInTheDocument()
})

test("Inflow filter works", async () => {
  const user = userEvent.setup()
  const onChange = vi.fn()
  renderTransactionView(mockData(100))
  await user.click(await screen.findByRole("button", { name: "Filter" }))
  await user.click(await screen.findByLabelText("Inflow"))
  const cells = await screen.findAllByRole("gridcell")
  // console.log(
  //   cells
  //     .map((c, i) => [c, i] as const)
  //     .filter(([c, i]) => c.textContent?.match(/\$\d+\.\d{2}/))
  //     .map(([t, i]) => i),
  // )
  for (const i of [...Array(50).keys()]) {
    expect(cells[3 + 10 * i].textContent).toMatch(/^\$\s*\d+\.\d{2}\s*$/)
  }
})

test("Outflow filter works", async () => {
  const user = userEvent.setup()
  render(
    () => (
      <Router>
        {" "}
        <TransactionView rawData={mockData(100)} />
      </Router>
    ),
    {
      location: "/app/transactions",
    },
  )
  // await user.click(await screen.findByRole("button", { name: "Filter" }))
  await user.click(await screen.findByLabelText("Outflow"))
  const cells = await screen.findAllByRole("gridcell")
  // console.log(
  //   cells
  //     .map((c, i) => [c, i] as const)
  //     .filter(([c, i]) => c.textContent?.match(/\$\d+\.\d{2}/))
  //     .map(([t, i]) => i),
  // )
  for (const i of [...Array(50).keys()]) {
    expect(cells[2 + 10 * i].textContent).toMatch(/^\$\s*\d+\.\d{2}\s*$/)
  }
})

test("Max filter works", async () => {
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  // await user.click(await screen.findByRole("button", { name: "Filter" }))
  const minInput = await screen.findByLabelText("Maximum Amount")
  await user.type(minInput, "100")
  const amounts = screen
    .getAllByText(/\$\d+\.\d{2}/)
    .map((elmt) => elmt.textContent)
  expect(amounts.every((val) => parseFloat(val!.slice(1)) <= 100)).toBeTruthy()
})

test("Min filter works", async () => {
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  // await user.click(await screen.findByRole("button", { name: "Filter" }))
  const minInput = await screen.findByLabelText("Minimum Amount")
  await user.type(minInput, "100")
  const amounts = screen
    .getAllByText(/\$\d+\.\d{2}/)
    .map((elmt) => elmt.textContent)
  expect(amounts.every((val) => parseFloat(val!.slice(1)) >= 100)).toBeTruthy()
})

test("Clear filter", async () => {
  const user = userEvent.setup()
  renderTransactionView(mockData(40))
  await user.click(await screen.findByLabelText("Inflow"))
  await user.type(screen.getByLabelText("Minimum Amount"), "100")
  await user.type(screen.getByLabelText("Query"), "abc")
  expect((await screen.findAllByRole("row")).length).toBeLessThan(41)
  await user.click(screen.getByRole("button", { name: "clear" }))
  expect(screen.getAllByRole("row")).toHaveLength(41)
})

test("Close filter bar works", async () => {
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  await user.click(
    await screen.findByRole("button", {
      name: "Close Filter Bar",
    }),
  )
  expect(screen.getByRole("button", { name: "Filter" })).toBeInTheDocument()
})

test("Check all transactions", async ({ expect }) => {
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  const checkboxes = await screen.findAllByRole("checkbox")
  await user.click(checkboxes[0])
  for (const checkbox of checkboxes) {
    expect(checkbox).toBeChecked()
  }
})

test("Filtered items remain unchecked", async ({ expect }) => {
  const getOutflow = (coll: HTMLCollection) => coll.item(3)?.textContent
  const user = userEvent.setup()
  renderTransactionView(mockData(100))
  await user.click(await screen.findByRole("button", { name: "Filter" }))
  const minAmount = screen.getByLabelText("Minimum Amount")
  await user.type(minAmount, "500")
  await user.click(screen.getByLabelText("Inflow"))
  await user.click(screen.getAllByRole("checkbox")[0])
  await user.clear(minAmount)
  const rows = await screen.findAllByRole("row")
  for (const row of rows) {
    if (parseFloat(getOutflow(row.children)!.slice(1)) < 500) {
      expect(within(row).getByRole("checkbox")).not.toBeChecked()
    }
  }
})

test.skip("Bank Account filtered according to search param", async ({
  expect,
}) => {
  const user = userEvent.setup()
  const data = mockData(100)
  renderTransactionView(
    data,
    `/app/transactions?bankAccount=${data.transactions[1].bankAccount.id}`,
  )
  const rows = await screen.findAllByRole("row")
  screen.debug(within(rows[1]).getAllByRole("gridcell")[7])
  screen.debug(within(rows[2]).getAllByRole("gridcell")[7])

  screen.debug(within(rows[3]).getAllByRole("gridcell")[7])
})
