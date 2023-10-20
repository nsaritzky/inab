import { test } from "vitest"
import { faker } from "@faker-js/faker"
import { render, screen } from "@solidjs/testing-library"
import { TransactionRow } from "./TransactionRow"
import { Router } from "@solidjs/router"
import userEvent from "@testing-library/user-event"
import { createSignal } from "solid-js"

const mockAccount = () => ({
  id: faker.number.int(),
  name: faker.company.name(),
  userProvidedName: faker.finance.accountName(),
  userId: faker.string.uuid(),
  plaidId: faker.number.toString(),
  plaidItemId: null,
  creditCard: false,
})

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

const mockTransaction = () => ({
  id: faker.number.int(),
  amount: parseFloat(faker.finance.amount()),
  bankAccount: mockAccount(),
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

test("Clicking on the row switches it to editing", async () => {
  const txn = mockTransaction()
  const user = userEvent.setup()
  const [active, setActive] = createSignal(false)
  render(() => (
    <Router>
      <TransactionRow
        txn={txn}
        active={active()}
        checked={false}
        setChecked={() => {}}
        activate={() => {
          setActive(true)
          return 0
        }}
        deactivate={() => {}}
        userID="1"
        envelopeList={[]}
        accountNames={[]}
      />
    </Router>
  ))
  const cell = await screen.findByRole("gridcell", {
    name: txn.description,
  })
  await user.click(cell)
  const textboxes = await screen.findAllByRole("textbox")
  expect(textboxes.length).toBe(6)
})

test("Hitting escape cancels editing", async () => {
  const txn = mockTransaction()
  const user = userEvent.setup()
  const [active, setActive] = createSignal(false)
  render(() => (
    <Router>
      <TransactionRow
        txn={txn}
        active={active()}
        checked={false}
        setChecked={() => {}}
        activate={() => {
          setActive(true)
          return 0
        }}
        deactivate={() => {}}
        userID="1"
        envelopeList={[]}
        accountNames={[]}
      />
    </Router>
  ))
  const row = (await screen.findAllByRole("row"))[10]
  await user.click(row)
  await user.keyboard("{Escape}")
  expect(() => screen.getByRole("textbox")).toThrow()
})
