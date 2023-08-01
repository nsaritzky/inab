import { expect, test } from "vitest"
import { render, screen, fireEvent, within } from "solid-testing-library"
import Budget from "../routes/budget"
import "@testing-library/jest-dom"
import { createContext } from "solid-js"
import { useCentralStore } from "../store"
import CentralStoreContext from "~/CentralStoreContext"

Object.defineProperty(import.meta, "hot", { value: { data: {} } })

describe("Clicking on a row...", () => {
  test("...causes a textbox to appear within it", () => {
    render(() => {
      const store = useCentralStore()

      return (
        <CentralStoreContext.Provider value={store}>
          <Budget />
        </CentralStoreContext.Provider>
      )
    })

    const rows = screen.getAllByRole("row")
    fireEvent.click(rows[1])
    const input = screen.getByRole("textbox")
    expect(rows[1]).toContainElement(input)
  })
  test("...but not within other rows", () => {
    const store = useCentralStore()
    render(() => (
      <CentralStoreContext.Provider value={store}>
        <Budget />
      </CentralStoreContext.Provider>
    ))

    const rows = screen.getAllByRole("row")
    fireEvent.click(rows[2])
    const input = screen.getByRole("textbox")
    expect(rows[1]).not.toContainElement(input)
  })
})
