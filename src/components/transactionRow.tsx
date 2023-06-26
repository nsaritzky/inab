import type { Transaction } from "../types"
import { deleteTransaction } from "../store"
import { BiRegularPencil, BiRegularTrash } from "solid-icons/bi"

interface TransactionRowProps {
  txn: Transaction
}

export const TransactionRow = (props: TransactionRowProps) => (
  <tr class="border-y-2">
    <td>
      {props.txn.amount.toLocaleString("en-us", {
        style: "currency",
        currency: "USD",
      })}
    </td>
    <td>{props.txn.date.toLocaleDateString()}</td>
    <td>{props.txn.payee}</td>
    <td>{props.txn.envelope}</td>
    <td>{props.txn.account}</td>
    <td>{props.txn.description}</td>
    <td>
      <button
        type="submit"
        class="p-1 rounded bg-red-300"
        onClick={(e) => {
          e.preventDefault()
          deleteTransaction(props.txn.id)
        }}
      >
        <BiRegularTrash size={24} />
      </button>
    </td>
  </tr>
)
