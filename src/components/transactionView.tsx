import { For, Show, createSignal, useContext } from "solid-js"
import { AddTransactionForm } from "./newTransaction"
import { TransactionRow } from "./transactionRow"
import { dateToMonthYear } from "../utilities"
import { AiOutlinePlusCircle } from "solid-icons/ai"
import { CentralStoreContext } from "../App"
import { sort } from "@solid-primitives/signal-builders"

export const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)

  return (
    <div class="ml-64 w-auto">
      <div class="ml-4 mt-4 text-sm">
        <button
          onClick={(e) => {
            e.preventDefault()
            setEditingNewTransaction(true)
          }}
        >
          <div class="flex">
            <AiOutlinePlusCircle size={24} /> Add transaction
          </div>
        </button>
        <div class="table w-auto table-fixed divide-y">
          <div class="flex table-header-group text-left">
            <div class="table-cell w-14">Inflow</div>
            <div class="table-cell w-14">Outflow</div>
            <div class="table-cell w-24">Date</div>
            <div class="table-cell w-20">Payee</div>
            <div class="table-cell w-36">Envelope</div>
            <div class="table-cell w-20">Account</div>
            <div class="table-cell w-20">Description</div>
          </div>
          <For
            each={sort(
              state.transactions,
              (a, b) => b.date.getDate() - a.date.getDate()
            )()}
          >
            {(txn) => <TransactionRow txn={txn} />}
          </For>
          <Show when={editingNewTransaction()}>
            <AddTransactionForm
              setEditingNewTransaction={setEditingNewTransaction}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}
