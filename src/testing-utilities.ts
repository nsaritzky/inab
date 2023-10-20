import { faker } from "@faker-js/faker"
import { createSignal } from "solid-js"
import { BudgetInspectorProps } from "./components/BudgetInspector"

export const mockAccount = () => ({
  id: faker.number.int(),
  name: faker.company.name(),
  userProvidedName: faker.finance.accountName(),
  userId: faker.string.uuid(),
  plaidId: faker.number.toString(),
  plaidItemId: null,
  creditCard: false,
})

export const mockUser = () => ({
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

export const mockTransaction = () => ({
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

export const mockGoal = () => ({
  type: faker.helpers.arrayElement(["weekly", "monthly", "annual"]),
  amount: faker.number.float(),
  begin: faker.number.int({ min: 0, max: 50 }),
  due: faker.date.future(),
  envelopeName: faker.helpers.arrayElement(["Coffee", "Food", "Rent", "Fun"]),
  userID: "1",
})

export const mockBudgetInspectorProps = (): BudgetInspectorProps => {
  const [editingGoal, setEditingGoal] = createSignal(false)
  return {
    activeEnvelope: {
      name: faker.helpers.arrayElement(["Coffee", "Food", "Rent", "Fun"]),
      userID: "1",
      transactions: [...Array(10)].map(() => mockTransaction()),
      allocated: [...Array(50)].map(() => faker.number.float()),
      goals: [mockGoal()],
    },
    activeGoal: faker.helpers.maybe(() => mockGoal(), { probability: 0.8 }),
    netBalance: faker.number.float(),
    leftoverBalance: faker.number.float(),
    allocatedThisMonth: faker.number.float(),
    activityThisMonth: faker.number.float(),
    editingGoal: editingGoal(),
    setEditingGoal,
    userID: "1",
  }
}
