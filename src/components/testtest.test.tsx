import { TestComponent } from "./testtest"
import { test } from "vitest"
import { render, screen } from "solid-testing-library"
import { useCentralStore } from "../store"
import CentralStoreContext from "~/CentralStoreContext"

test("the component is rendered", () => {
  render(() => {
    const store = useCentralStore()
    return (
      <CentralStoreContext.Provider value={store}>
        <TestComponent testProp="Hello!" />
      </CentralStoreContext.Provider>
    )
  })
  screen.debug()
})
