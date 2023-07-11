import {
  Ref,
  Setter,
  createSignal,
  useContext,
  ParentComponent,
} from "solid-js"
import type { Envelope, Goal, Transaction } from "@prisma/client"
import { CentralStoreContext } from "../root"
import { Show } from "solid-js"
import { FormProps } from "solid-start"
import { dateToIndex } from "~/utilities"

interface BudgetRowProps {
  name: string
<<<<<<< HEAD
  envlp: Envelope & {
=======
  envelope: Envelope & {
>>>>>>> 41a4f80 (Integrated main budget pane with db)
    transactions: Transaction[]
    goals: Goal[]
    allocated: number[]
  }
  Form: ParentComponent<FormProps>
  active: boolean
  activate: () => void
  deactivate: () => void
  setActiveEnvelope: Setter<string>
}

export const BudgetRow = (props: BudgetRowProps) => {
  let inputRef: HTMLInputElement
  const [state, { envelopeBalances, netBalance, allocate }] =
    useContext(CentralStoreContext)!
  const [editing, setEditing] = createSignal(false)

  const activity = () =>
<<<<<<< HEAD
    props.envlp.transactions
=======
    props.envelope.transactions
>>>>>>> 41a4f80 (Integrated main budget pane with db)
      .filter((txn) => dateToIndex(txn.date) === state.activeMonth)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const monthlyBalances = () =>
<<<<<<< HEAD
    props.envlp.allocated.map(
      (x, i) =>
        x +
        props.envlp.transactions
          .filter(
            (txn) =>
              dateToIndex(txn.date) == i &&
              txn.envelopeName === props.envlp.name
=======
    props.envelope.allocated.map(
      (x, i) =>
        x +
        props.envelope.transactions
          .filter(
            (txn) =>
              dateToIndex(txn.date) == i &&
              txn.envelopeName === props.envelope.name
>>>>>>> 41a4f80 (Integrated main budget pane with db)
          )
          .reduce((sum, txn) => sum + txn.amount, 0)
    )

  const netBalances = () =>
    monthlyBalances().map((_, i) =>
      monthlyBalances()
        .slice(0, i + 1)
        .reduce((a, b) => a + b, 0)
    )

  return (
    <tr
      class={`${props.active && "bg-sky-200"} group rounded p-2`}
      onClick={(e) => {
        e.preventDefault()
        props.activate()
        inputRef.focus()
        inputRef.select()
      }}
    >
      <td>{props.name}</td>
      <td>
        <Show
          when={props.active}
          fallback={
            <div class="mr-2 py-1">
              <div
                class={`rounded outline-2 outline-blue-500 group-hover:outline`}
              >
<<<<<<< HEAD
                {props.envlp.allocated[state.activeMonth].toLocaleString(
=======
                {props.envelope.allocated[state.activeMonth].toLocaleString(
>>>>>>> 41a4f80 (Integrated main budget pane with db)
                  "en-us",
                  {
                    style: "currency",
                    currency: "USD",
                  }
                )}
              </div>
            </div>
          }
        >
          <div class="mr-2 py-1">
            <props.Form
              name="allocate"
              onSubmit={() => {
                props.deactivate()
              }}
            >
              <input
                type="text"
                class=" w-full rounded"
                name="amount"
<<<<<<< HEAD
                value={props.envlp.allocated[state.activeMonth]}
=======
                value={props.envelope.allocated[state.activeMonth]}
>>>>>>> 41a4f80 (Integrated main budget pane with db)
                ref={inputRef!}
              />
              <input type="hidden" name="envelopeName" value={props.name} />
              <input
                type="hidden"
                name="monthIndex"
                value={state.activeMonth}
              />
            </props.Form>
          </div>
        </Show>
      </td>
      <td>
        {activity().toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </td>
      <td>
        {netBalances()[state.activeMonth].toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </td>
    </tr>
  )
}
