import { Budget } from "./components/budget"
import { createCentralStore, initialState } from "./store"
import { TransactionView } from "./components/transactionView"
import { Sidebar } from "./components/sidebar"
import { Switch, Match, createContext } from "solid-js"
import "solid-devtools"

export const CentralStoreContext =
  createContext<ReturnType<typeof createCentralStore>>()

function App() {
  const [state, fns] = createCentralStore()
  return (
    <div class="flex">
      <CentralStoreContext.Provider value={[state, fns]}>
        <Sidebar />
        <Switch>
          <Match when={state.panel == "transactions"}>
            <TransactionView />
          </Match>
          <Match when={state.panel == "budget"}>
            <Budget />
          </Match>
        </Switch>
      </CentralStoreContext.Provider>
    </div>
  )
}
export default App
