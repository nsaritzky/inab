import { Component, For } from "solid-js"
import type { Month, MonthYear } from "../types"
import { state, setState, envelopeBalances } from "../store"
import MonthSelector from "./monthSelector"

interface BudgetProps {
  month: MonthYear
}

const getAllocated = (my: MonthYear, envlp: string) =>
  Object.keys(state.envelopes[envlp].allocated).includes(my)
    ? state.envelopes[envlp].allocated[my]
    : 0

export const Budget: Component<BudgetProps> = (props) => {
  return (
    <div class="ml-64">
      <div class="mt-4 ml-4">
        <MonthSelector />
        <table class="table-fixed w-full">
          <thead>
            <tr class="text-left">
              <th>Category</th>
              <th>Assigned</th>
              <th>Activity</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            <For each={Object.entries(state.envelopes)}>
              {([nm, envlp]) => (
                <tr>
                  <td>{nm}</td>
                  <td>
                    {getAllocated(props.month, nm).toLocaleString("en-us", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td>
                    {envelopeBalances()[nm].toLocaleString("en-us", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                  <td>
                    {(
                      getAllocated(props.month, nm) + envelopeBalances()[nm]
                    ).toLocaleString("en-us", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
