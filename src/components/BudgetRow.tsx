import { Ref, createSignal, useContext } from "solid-js"
import type { Envelope, MonthYear } from "../types"
import { CentralStoreContext } from "../App"
import { Show } from "solid-js"

interface BudgetRowProps {
  name: string
  envlp: Envelope
  allocated: number
}

export const BudgetRow = (props: BudgetRowProps) => {
  let inputRef: HTMLInputElement
  const [state, { envelopeBalances, setAllocated }] =
    useContext(CentralStoreContext)
  const [editing, setEditing] = createSignal(false)

  return (
    <tr
      class="p-2"
      onClick={(e) => {
        e.preventDefault()
        console.log(state)
        setEditing(true)
        inputRef.focus()
        inputRef.select()
      }}
    >
      <td>{props.name}</td>
      <Show
        when={editing()}
        fallback={
          <td>
            {props.allocated.toLocaleString("en-us", {
              style: "currency",
              currency: "USD",
            })}
          </td>
        }
      >
        <td>
          <form
            name="allocate"
            onSubmit={(e) => {
              e.preventDefault()
              setEditing(false)
            }}
          >
            <input
              type="text"
              class="m-0.5 w-full"
              name="allocated"
              value={state.envelopes[props.name].allocated[state.currentMonth]}
              onChange={(e) =>
                setAllocated(
                  props.name,
                  state.currentMonth,
                  parseFloat(e.target.value)
                )
              }
              ref={inputRef!}
              onFocus={() => console.log("focused")}
              onBlur={() => setEditing(false)}
            />
          </form>
        </td>
      </Show>
      <td>
        {envelopeBalances()[props.name].toLocaleString("en-us", {
          style: "currency",
          currency: "USD",
        })}
      </td>
      <td>
        {(props.allocated + envelopeBalances()[props.name]).toLocaleString(
          "en-us",
          {
            style: "currency",
            currency: "USD",
          }
        )}
      </td>
    </tr>
  )
}
