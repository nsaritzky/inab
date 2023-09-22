import { expect, test } from "vitest"
import { render, screen } from "@solidjs/testing-library"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom"
import { useCentralStore } from "~/store"
import CentralStoreContext from "~/CentralStoreContext"
import MonthSelector from "~/components/monthSelector"
import type { UserEvent } from "@testing-library/user-event/dist/types/setup/setup"

let user: UserEvent

beforeEach(() => {
  user = userEvent.setup()
  render(() => {
    const ctx = useCentralStore()
    const [_, { setMonth }] = ctx
    setMonth(1)
    return (
      <CentralStoreContext.Provider value={ctx}>
        <MonthSelector />
      </CentralStoreContext.Provider>
    )
  })
})

test("The previous and nextmonth buttons work", async () => {
  const prevMonth = screen.getByRole("button", { name: "previous month" })
  await userEvent.click(prevMonth)
  expect(screen.getByRole("button", { name: "JAN 2023" }))
  const nextMonth = screen.getByRole("button", { name: "next month" })
  await userEvent.click(nextMonth)
  await userEvent.click(nextMonth)
  expect(screen.getByRole("button", { name: "MAR 2023" }))
})

test("Clicking the current month opens the popover", async () => {
  const openButton = screen.getByRole("button", { name: "FEB 2023" })
  await user.click(openButton)
  expect(screen.getByRole("dialog"))
})
