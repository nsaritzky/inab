import { expect, test } from "vitest"
import { render, screen, fireEvent, within } from "solid-testing-library"
import { Budget } from "./budget"
import "@testing-library/jest-dom"

describe("Clicking on a row...", () => {
  test("...causes a textbox to appear within it", () => {
    render(() => <Budget />)

    const rows = screen.getAllByRole("row")
    fireEvent.click(rows[1])
    const input = screen.getByRole("textbox")
    expect(rows[1]).toContainElement(input)
  })
  test("...but not within other rows", () => {
    render(() => <Budget />)

    const rows = screen.getAllByRole("row")
    fireEvent.click(rows[2])
    const input = screen.getByRole("textbox")
    expect(rows[1]).not.toContainElement(input)
  })
})
