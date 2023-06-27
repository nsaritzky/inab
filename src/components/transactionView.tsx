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
        <table class="table-fixed w-full border-collapse">
          <thead>
            <tr class="text-left">
              <th class="w-20">Amount</th>
              <th>Date</th>
              <th>Payee</th>
              <th>Envelope</th>
              <th>Account</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <For each={state.transactions}>
              {(txn) => <TransactionRow txn={txn} />}
            </For>
            <AddTransactionForm />
          </tbody>
        </table>
      </div>
    </div>
  )
}
