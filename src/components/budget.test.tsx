import { expect, test } from "vitest"
import { render, screen, fireEvent, within } from "solid-testing-library"
import { Budget } from "./budget"
import "@testing-library/jest-dom"
import { createContext } from "solid-js"
import { createCentralStore } from "../store"
import { CentralStoreContext } from "../App"

describe("Clicking on a row...", () => {
  test("...causes a textbox to appear within it", () => {
    render(() => {
      const store = createCentralStore()

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
    const store = createCentralStore()
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
