import type { Transaction } from "../types"
import { deleteTransaction } from "../App"

interface TransactionRowProps {
  txn: Transaction
}

export const TransactionRow = (props: TransactionRowProps) => (
  <tr class="">
    <td>{props.txn.amount}</td>
    <td>{props.txn.date.getDate()}</td>
    <td>{props.txn.envelope}</td>
    <td>{props.txn.account}</td>
    <td>{props.txn.description}</td>
    <td>
      <button>edit</button>
    </td>
    <td>
      <button
        type="submit"
        onClick={(e) => {
          e.preventDefault()
          deleteTransaction(props.txn.id)
        }}
      >
        delete
      </button>
    </td>
  </tr>
)
