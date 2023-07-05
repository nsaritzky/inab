import { Ref, Setter, createSignal, useContext } from "solid-js"
import type { Envelope, MonthYear } from "../types"
import { CentralStoreContext } from "../App"
import { Show } from "solid-js"

interface BudgetRowProps {
  name: string
  envlp: Envelope
  allocated: number
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
                {props.allocated.toLocaleString("en-us", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </div>
          }
        >
          <div class="mr-2 py-1">
            <form
              name="allocate"
              onSubmit={(e) => {
                e.preventDefault()
                props.deactivate()
              }}
            >
              <input
                type="text"
                class=" w-full rounded"
                name="allocated"
                value={state.envelopes[props.name].allocated[state.activeMonth]}
                onChange={(e) =>
                  allocate(
                    props.name,
                    state.activeMonth,
                    parseFloat(e.target.value)
                  )
                }
                ref={inputRef!}
                onBlur={props.deactivate}
              />
            </form>
          </div>
        </Show>
      </td>
      <td>
        {envelopeBalances()[props.name].toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </td>
      <td>
        {netBalance()[props.name][state.activeMonth].toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </td>
    </tr>
  )
}
