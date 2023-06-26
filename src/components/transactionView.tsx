import { For } from "solid-js"
import { state } from "../store"
import { AddTransactionForm } from "./newTransaction"
import { TransactionRow } from "./transactionRow"

export const TransactionView = () => (
  <div class="ml-64">
    <div class="mt-4 ml-4  rounded">
      <table class="table-auto w-full border-collapse">
        <thead>
          <tr class="text-left">
            <th class="">Amount</th>
            <th>Time</th>
            <th>Envelope</th>
            <th>Account</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <For each={Object.values(state.transactions)}>
            {(txn) => <TransactionRow txn={txn} />}
          </For>
          <AddTransactionForm />
        </tbody>
      </table>
    </div>
  </div>
)
