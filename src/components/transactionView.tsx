import { For } from "solid-js"
import { state } from "../App"
import { AddTransactionForm } from "./newTransaction"
import { TransactionRow } from "./transactionRow"

export const TransactionView = () => (
  <div class="ml-64">
    <table class="table-fixed w-full">
      <thead>
        <tr class="text-left">
          <th class="border border-slate-500">Amount</th>
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
)
