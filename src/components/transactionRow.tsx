import { Setter, Show, createEffect, useContext } from "solid-js"
import type { Transaction } from "../types"
import { BiRegularPencil, BiRegularTrash } from "solid-icons/bi"
import { CentralStoreContext } from "../App"
import { TransactionForm } from "./transactionForm"
import { useKeyDownEvent } from "@solid-primitives/keyboard"

interface TransactionRowProps {
  txn: Transaction
  active: boolean
  activate: () => number
  deactivate: () => void
}

interface TransactionDisplayProps {
  txn: Transaction
  activate: () => number
  deactivate: () => void
}

interface TransactionEditProps {}

const TransactionDisplay = (props: TransactionDisplayProps) => {
  const [_, { deleteTransaction }] = useContext(CentralStoreContext)!

  return (
    <div
      class="mb-1 table-row pt-1 text-xs"
      onClick={props.activate}
      onKeyDown={(e) => console.log(e.key)}
      tabIndex="0"
      role="row"
    >
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
            props.deactivate()
          }}
        >
          <BiRegularTrash size={14} />
        </button>
      </div>
    </div>
  )
}

export const TransactionRow = (props: TransactionRowProps) => {
  const keyDownEvent = useKeyDownEvent()

  createEffect(() => {
    const e = keyDownEvent()
    if (e && props.active) {
      if (e.key === "Escape") {
        props.deactivate()
      }
    }
  })

  return (
    <Show when={props.active} fallback={<TransactionDisplay {...props} />}>
      <TransactionForm txn={props.txn} deactivate={props.deactivate} />
    </Show>
  )
}
