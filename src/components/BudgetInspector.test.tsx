import { test } from "vitest"
import { render, screen } from "@solidjs/testing-library"
import { BudgetInspector, BudgetInspectorProps } from "./BudgetInspector"
import userEvent from "@testing-library/user-event"
import { mockGoal, mockTransaction } from "~/testing-utilities"
import CentralStoreContext from "~/CentralStoreContext"
import { useCentralStore } from "~/store"
import { faker } from "@faker-js/faker"
import { createSignal, Setter } from "solid-js"
import { Router } from "@solidjs/router"

export const mockBudgetInspectorProps = (args: {
  active: boolean
  editingGoal: boolean
  setEditingGoal: Setter<boolean>
}): BudgetInspectorProps => {
  return {
    activeEnvelope: {
      name: faker.helpers.arrayElement(["Coffee", "Food", "Rent", "Fun"]),
      userID: "1",
      transactions: [...Array(10)].map(() => mockTransaction()),
      allocated: [...Array(50)].map(() => faker.number.float()),
      goals: [mockGoal()],
    },
    activeGoal: args.active ? mockGoal() : undefined,
    netBalance: faker.number.float(),
    leftoverBalance: faker.number.float(),
    allocatedThisMonth: faker.number.float(),
    activityThisMonth: faker.number.float(),
    editingGoal: args.editingGoal,
    setEditingGoal: args.setEditingGoal,
    userID: "1",
  }
}

test("Clicking add savings goal opens menu", async () => {
  const user = userEvent.setup()
  render(() => {
    const [editingGoal, setEditingGoal] = createSignal(false)
    return (
      <Router>
        <CentralStoreContext.Provider value={useCentralStore()}>
          <BudgetInspector
            {...mockBudgetInspectorProps({
              active: false,
              editingGoal: editingGoal(),
              setEditingGoal,
            })}
          />
        </CentralStoreContext.Provider>
      </Router>
    )
  })
  const button = await screen.findByRole("button", {
    name: "Add a savings goal",
  })
  await user.click(button)
  screen.getByRole("button", { name: "Submit" })
})

test("Clicking 'cancel' closes goal editing", async () => {
  const user = userEvent.setup()
  render(() => {
    const [editingGoal, setEditingGoal] = createSignal(false)
    return (
      <Router>
        <CentralStoreContext.Provider value={useCentralStore()}>
          <BudgetInspector
            {...mockBudgetInspectorProps({
              active: false,
              editingGoal: editingGoal(),
              setEditingGoal,
            })}
          />
        </CentralStoreContext.Provider>
      </Router>
    )
  })
  const button = await screen.findByRole("button", {
    name: "Add a savings goal",
  })
  await user.click(button)
  await user.click(screen.getByRole("button", { name: "Cancel" }))
  screen.getByRole("button", { name: "Add a savings goal" })
})
