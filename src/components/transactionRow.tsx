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
    <div class="flex py-1">
      <div class="w-1/12">
        {props.txn.amount.toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}{" "}
      </div>
      <div class="w-1/6">{props.txn.date.toLocaleDateString()}</div>
      <div class="w-1/6">{props.txn.payee}</div>
      <div class="w-1/6">{props.txn.envelope}</div>
      <div class="w-1/6">{props.txn.account}</div>
      <div class="w-1/6">{props.txn.description}</div>
      <div class="w-1/12">
        <button
          type="submit"
          class="rounded bg-red-300 p-1"
          onClick={(e) => {
            e.preventDefault()
            deleteTransaction(props.txn.id)
          }}
        >
          <BiRegularTrash size={24} />
        </button>
      </div>
    </div>
  )
}
