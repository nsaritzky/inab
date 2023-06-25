import type { Store, Transaction } from "./types"
import { createStore } from "solid-js/store"
import { TransactionRow } from "./components/transactionRow"
import { AddTransactionForm } from "./components/newTransaction"
import { TransactionView } from "./components/transactionView"
import { Sidebar } from "./components/sidebar"
import { v4 as uuid } from "uuid"
import { Switch, Match } from "solid-js"
import "solid-devtools"

const sampleTxns: Transaction[] = [
  {
    id: "0",
    description: "test",
    amount: 1,
    envelope: "Groceries",
    account: "Checking",
    date: new Date(),
  },
  {
    id: "1",
    description: "another test",
    amount: 2,
    envelope: "Rent",
    account: "Checking",
    date: new Date(),
  },
]
export const [state, setState] = createStore<Store>({
  transactions: sampleTxns,
  envelopes: [],
  accounts: [],
  panel: "transactions",
})

export const addTransaction = ({
  amount,
  date,
  envelope,
  account,
  description,
}: Omit<Transaction, "id">) => {
  console.log(description)
  setState("transactions", (txns) => [
    ...txns,
    { id: uuid(), amount, date, envelope, account, description },
  ])
}

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
