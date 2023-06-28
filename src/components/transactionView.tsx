import { For, Show, createSignal, useContext } from "solid-js"
import { AddTransactionForm } from "./newTransaction"
import { TransactionRow } from "./transactionRow"
import { dateToMonthYear } from "../utilities"
import { AiOutlinePlusCircle } from "solid-icons/ai"
import { CentralStoreContext } from "../App"

export const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)

  return (
    <div class="ml-64 w-full">
      <div class="ml-4 mt-4">
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
        <div class="w-full">
          <div class="flex text-left">
            <div class="w-1/12">Amount</div>
            <div class="w-1/6">Date</div>
            <div class="w-1/6">Payee</div>
            <div class="w-1/6">Envelope</div>
            <div class="w-1/6">Account</div>
            <div class="w-1/4">Description</div>
          </div>
          <div>
            <For each={state.transactions}>
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
    </div>
  )
}
