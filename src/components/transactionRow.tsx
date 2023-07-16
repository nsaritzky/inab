import { Setter, Show, createEffect, useContext } from "solid-js"
import type { Transaction } from "@prisma/client"
import { BiRegularPencil, BiRegularTrash } from "solid-icons/bi"
import { CentralStoreContext } from "../root"
import { TransactionForm } from "./transactionForm"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import {
  createServerAction$,
  createServerMultiAction$,
} from "solid-start/server"
import { deleteTransaction } from "~/db"

interface TransactionRowProps {
  txn: Transaction
  active: boolean
  activate: () => number
  deactivate: () => void
  userID: string
}

interface TransactionDisplayProps {
  txn: Transaction
  doDelete: (txn: Transaction) => Promise<void>
  activate: () => number
  deactivate: () => void
}

interface TransactionEditProps {}

const TransactionDisplay = (props: TransactionDisplayProps) => {
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
      <div class="table-cell ">{props.txn.envelopeName}</div>
      <div class="table-cell ">{props.txn.description}</div>
      <div class="table-cell ">
        <button
          type="submit"
          class="rounded bg-red-300 p-1"
          onClick={(e) => {
            e.preventDefault()
            props.doDelete(props.txn)
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
  const [doingDelete, doDelete] = createServerAction$(deleteTransaction)

  createEffect(() => {
    const e = keyDownEvent()
    if (e && props.active) {
      if (e.key === "Escape") {
        props.deactivate()
      }
    }
  })

  return (
    <Show when={!doingDelete.pending}>
      <Show
        when={props.active}
        fallback={<TransactionDisplay doDelete={doDelete} {...props} />}
      >
        <TransactionForm
          txn={props.txn}
          userID={props.userID}
          deactivate={props.deactivate}
        />
      </Show>
    </Show>
  )
}
