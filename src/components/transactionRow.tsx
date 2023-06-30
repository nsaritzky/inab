import { useContext } from "solid-js"
import type { Transaction } from "../types"
import { BiRegularPencil, BiRegularTrash } from "solid-icons/bi"
import { CentralStoreContext } from "../App"

interface TransactionRowProps {
  txn: Transaction
}

export const TransactionRow = (props: TransactionRowProps) => {
  const [_, { deleteTransaction }] = useContext(CentralStoreContext)
  return (
    <div class="mb-1 table-row pt-1">
      <div class="table-cell ">
        {props.txn.amount > 0 &&
          props.txn.amount.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div class="table-cell ">
        {props.txn.amount < 0 &&
          props.txn.amount.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div class="table-cell ">{props.txn.date.toLocaleDateString()}</div>
      <div class="table-cell ">{props.txn.payee}</div>
      <div class="table-cell ">{props.txn.envelope}</div>
      <div class="table-cell ">{props.txn.account}</div>
      <div class="table-cell ">{props.txn.description}</div>
      <div class="table-cell ">
        <button
          type="submit"
          class="rounded bg-red-300 p-1"
          onClick={(e) => {
            e.preventDefault()
            deleteTransaction(props.txn.id)
          }}
        >
          <BiRegularTrash size={14} />
        </button>
      </div>
    </div>
  )
}
