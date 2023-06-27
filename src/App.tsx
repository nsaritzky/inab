import type { Store, Transaction } from "./types"
import { createStore } from "solid-js/store"
import { Budget } from "./components/budget"
import { createCentralStore } from "./store"
import { TransactionView } from "./components/transactionView"
import CentralStoreProvider from "./components/storeProvider"
import { Sidebar } from "./components/sidebar"
import { v4 as uuid } from "uuid"
import { Switch, Match, createContext } from "solid-js"
import "solid-devtools"

export const CentralStoreContext = createContext(createCentralStore())

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
            <Budget month={state.currentMonth} />
          </Match>
        </Switch>
      </CentralStoreContext.Provider>
    </div>
  )
}
export default App
