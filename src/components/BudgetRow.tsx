import {
  Ref,
  Setter,
  createSignal,
  useContext,
  ParentComponent,
  createEffect,
} from "solid-js"
import type { Envelope, Goal, Transaction } from "@prisma/client"
import CentralStoreContext from "~/CentralStoreContext"
import { Show } from "solid-js"
import { Progress } from "@kobalte/core"
import { FormProps } from "solid-start"
import { dateToIndex } from "~/utilities"
import CurrencyInput from "solid-currency-input-field"

interface BudgetRowProps {
  name: string
  envelope: Envelope & {
    transactions: Transaction[]
    goals: Goal[]
    allocated: number[]
  }
  Form: ParentComponent<FormProps>
  active: boolean
  activate: () => void
  deactivate: () => void
  setActiveEnvelope: Setter<string>
  userID: string
}

export const BudgetRow = (props: BudgetRowProps) => {
  let inputRef: HTMLInputElement
  const [state, { envelopeBalances, netBalance, allocate }] =
    useContext(CentralStoreContext)!
  const [editing, setEditing] = createSignal(false)
  const [value, setValue] = createSignal<string>()

  const activity = () =>
    props.envelope.transactions
      .filter((txn) => dateToIndex(txn.date) === state.activeMonth)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const monthlyBalances = () =>
    props.envelope.allocated.map(
      (x, i) =>
        x +
        props.envelope.transactions
          .filter(
            (txn) =>
              dateToIndex(txn.date) == i &&
              txn.envelopeName === props.envelope.name,
          )
          .reduce((sum, txn) => sum + txn.amount, 0),
    )

  const netBalances = () =>
    monthlyBalances().map((_, i) =>
      monthlyBalances()
        .slice(0, i + 1)
        .reduce((a, b) => a + b, 0),
    )

  const allocatedThisMonth = () => props.envelope.allocated[state.activeMonth]
  const goalAmount = () => props.envelope.goals[0]?.amount

  return (
    <>
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
                  {props.envelope.allocated[state.activeMonth].toLocaleString(
                    "en-us",
                    {
                      style: "currency",
                      currency: "USD",
                    },
                  )}
                </div>
              </div>
            }
          >
            <div class="mr-2 py-1">
              <props.Form
                name="allocate"
                onSubmit={(e) => {
                  props.deactivate()
                }}
              >
                <CurrencyInput
                  type="text"
                  class=" w-full rounded"
                  name="amountInput"
                  decimalScale={2}
                  groupSeparator=","
                  decimalSeparator="."
                  intlConfig={{ locale: "en-US", currency: "USD" }}
                  onValueChange={(value) => setValue(value)}
                  defaultValue={props.envelope.allocated[state.activeMonth]}
                  ref={inputRef!}
                />
                <input type="hidden" name="envelopeName" value={props.name} />
                <input
                  type="hidden"
                  name="monthIndex"
                  value={state.activeMonth}
                />
                <input type="hidden" name="userID" value={props.userID} />
                <input type="hidden" name="amount" value={value()} />
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
      <tr>
        <td colspan="4">
          <Progress.Root
            class="w-full"
            value={allocatedThisMonth()}
            maxValue={goalAmount()}
          >
            <Progress.Track class="h-1">
              <Progress.Fill
                class={`h-full w-progress ${
                  goalAmount()
                    ? "ui-loading:bg-yellow-400 ui-complete:bg-sky-500"
                    : ""
                }`}
              />
            </Progress.Track>
          </Progress.Root>
        </td>
      </tr>
    </>
  )
}
