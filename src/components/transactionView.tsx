import { For, useContext } from "solid-js"
import { AddTransactionForm } from "./newTransaction"
import { TransactionRow } from "./transactionRow"
import { dateToMonthYear } from "../utilities"
import { CentralStoreContext } from "../App"

export const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)
  return (
    <div class="ml-64">
      <div class="mt-4 ml-4  rounded">
        <div class="w-full">
          <div>
            <div class="flex text-left">
              <div class="w-1/12">Amount</div>
              <div class="w-1/6">Date</div>
              <div class="w-1/6">Payee</div>
              <div class="w-1/6">Envelope</div>
              <div class="w-1/6">Account</div>
              <div class="w-1/4">Description</div>
            </div>
          </div>
          <div>
            <For each={state.transactions}>
              {(txn) => <TransactionRow txn={txn} />}
            </For>
            <AddTransactionForm />
          </div>
        </div>
      </div>
    </div>
  )
}
