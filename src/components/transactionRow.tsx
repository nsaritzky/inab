import { Setter, Show, createEffect, useContext } from "solid-js"
import type { Prisma } from "@prisma/client"
import { BiRegularPencil, BiRegularTrash } from "solid-icons/bi"
import { FaSolidCircleCheck } from "solid-icons/fa"
import CentralStoreContext from "~/CentralStoreContext"
import { TransactionForm } from "./transactionForm"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import {
  createServerAction$,
  createServerMultiAction$,
} from "solid-start/server"
import { deleteTransaction, getTransactions } from "~/db"
import Checkbox from "./Checkbox"

type Transaction = Prisma.PromiseReturnType<typeof getTransactions>[number]

interface TransactionRowProps {
  txn: Transaction
  active: boolean
  checked: boolean
  setChecked: (b: boolean) => void
  activate: () => number
  deactivate: () => void
  userID: string
  envelopeList: string[]
  accountNames: string[]
}

interface TransactionDisplayProps {
  txn: Transaction
  checked: boolean
  setChecked: (b: boolean) => void
  doDelete: (txn: Transaction) => Promise<void>
  activate: () => number
  deactivate: () => void
}

interface TransactionEditProps {}

const TransactionDisplay = (props: TransactionDisplayProps) => {
  return (
    <div
      class="mb-1 table-row truncate  pt-1 text-xs"
      onKeyDown={(e) => console.log(e.key)}
      tabIndex="0"
      role="row"
    >
      <div class="table-cell text-sm">
        <Checkbox checked={props.checked} onChange={props.setChecked} />
      </div>
      <div class="table-cell" onClick={() => props.activate()}>
        <Show when={!props.txn.pending}>
          <FaSolidCircleCheck fill="green" title="cleared" />
        </Show>
      </div>
      <div class="table-cell" onClick={() => props.activate()}>
        {props.txn.amount > 0 &&
          props.txn.amount.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div class="table-cell" onClick={() => props.activate()}>
        {props.txn.amount < 0 &&
          (-1 * props.txn.amount).toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div class="table-cell " onClick={() => props.activate()}>
        {props.txn.date.toLocaleDateString()}
      </div>
      <div
        class="table-cell max-w-[12cqw] truncate"
        onClick={() => props.activate()}
        title={props.txn.payee}
      >
        {props.txn.payee}
      </div>
      <div class="table-cell " onClick={() => props.activate()}>
        {props.txn.envelopeName}
      </div>
      <div class="table-cell" onClick={() => props.activate()}>
        {props.txn.bankAccount.name}
      </div>
      <div class="table-cell " onClick={() => props.activate()}>
        {props.txn.description}
      </div>
      <div class="table-cell " onClick={() => props.activate()}>
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
          newTransaction={false}
          accountNames={props.accountNames}
          checked={props.checked}
          setChecked={props.setChecked}
          txn={props.txn}
          userID={props.userID}
          deactivate={props.deactivate}
          envelopeList={props.envelopeList}
        />
      </Show>
    </Show>
  )
}
