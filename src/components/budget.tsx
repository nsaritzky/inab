import { Component, For, useContext } from "solid-js"
import type { Month, MonthYear } from "../types"
import MonthSelector from "./monthSelector"
import Unallocated from "./unallocated"
import { CentralStoreContext } from "../App"

interface BudgetProps {
  month: MonthYear
}

export const Budget: Component<BudgetProps> = (props) => {
  const [state, { envelopeBalances }] = useContext(CentralStoreContext)

  const getAllocated = (my: MonthYear, envlp: string) =>
    Object.keys(state.envelopes[envlp].allocated).includes(my)
      ? state.envelopes[envlp].allocated[my]
      : 0

  return (
    <div class="ml-64">
      <div class="mt-4 ml-4">
        <div class="flex mb-2">
          <MonthSelector />
          <Unallocated />
        </div>
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
