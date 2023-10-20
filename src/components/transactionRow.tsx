import {
  Setter,
  Show,
  createEffect,
  useContext,
  Component,
  createSignal,
} from "solid-js"
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

const TransactionDisplay: Component<TransactionDisplayProps> = (props) => {
  const [confirmingDelete, setConfirmingDelete] = createSignal(false)

  const ConfirmDelete: Component = () => {
    return (
      <div class="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white rounded p-4">
          <div class="text-center">
            <p>Are you sure you want to delete this transaction?</p>
            <div class="flex justify-center">
              <button
                class="rounded bg-red-300 p-1 mr-2"
                onClick={(e) => {
                  e.preventDefault()
                  props.doDelete(props.txn)
                  props.deactivate()
                }}
              >
                Yes
              </button>
              <button
                class="rounded bg-green-300 p-1"
                onClick={(e) => {
                  e.preventDefault()
                  setConfirmingDelete(false)
                  props.deactivate()
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      class="mb-1 table-row truncate  pt-1 text-xs"
      onKeyDown={(e) => console.log(e.key)}
      tabIndex="0"
      role="row"
    >
      <div role="gridcell" class="table-cell text-sm">
        <Checkbox checked={props.checked} onChange={props.setChecked} />
      </div>
      <div role="gridcell" class="table-cell" onClick={() => props.activate()}>
        <Show when={!props.txn.pending}>
          <FaSolidCircleCheck fill="green" title="cleared" />
        </Show>
      </div>
      <div role="gridcell" class="table-cell" onClick={() => props.activate()}>
        {props.txn.amount > 0 &&
          props.txn.amount.toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div role="gridcell" class="table-cell" onClick={() => props.activate()}>
        {props.txn.amount < 0 &&
          (-1 * props.txn.amount).toLocaleString("en-us", {
            style: "currency",
            currency: "USD",
          })}{" "}
      </div>
      <div role="gridcell" class="table-cell " onClick={() => props.activate()}>
        {props.txn.date.toLocaleDateString()}
      </div>
      <div
        role="gridcell"
        class="table-cell max-w-[12cqw] truncate"
        onClick={() => props.activate()}
        title={props.txn.payee}
      >
        {props.txn.payee}
      </div>
      <div role="gridcell" class="table-cell " onClick={() => props.activate()}>
        {props.txn.envelopeName}
      </div>
      <div role="gridcell" class="table-cell" onClick={() => props.activate()}>
        {props.txn.bankAccount.userProvidedName || props.txn.bankAccount.name}
      </div>
      <div role="gridcell" class="table-cell " onClick={() => props.activate()}>
        {props.txn.description}
      </div>
      <div role="gridcell" class="table-cell ">
        <Show when={!confirmingDelete()} fallback={<ConfirmDelete />}>
          <button
            type="submit"
            class="rounded bg-red-300 p-1"
            onClick={(e) => {
              e.preventDefault()
              setConfirmingDelete(true)
              props.deactivate()
            }}
          >
            <BiRegularTrash size={14} />
          </button>
        </Show>
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
