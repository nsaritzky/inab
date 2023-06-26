import type { Store, Transaction } from "./types"
import { createStore } from "solid-js/store"
import { TransactionRow } from "./components/transactionRow"
import { AddTransactionForm } from "./components/newTransaction"
import { TransactionView } from "./components/transactionView"
import { Sidebar } from "./components/sidebar"
import { v4 as uuid } from "uuid"
import { Switch, Match } from "solid-js"
import { state, setState, addTransaction } from "./store"
import "solid-devtools"

export const deleteTransaction = (id: string) =>
  setState("transactions", (txns) => txns.filter((t) => t.id != id))

function App() {
  return (
    <div class="flex">
      <Sidebar />
      <Switch>
        <Match when={state.panel == "transactions"}>
          <TransactionView />
        </Match>
      </Switch>
    </div>
  )
}
export default App
