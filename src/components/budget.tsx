import { Component, For, useContext } from "solid-js"
import type { Month, MonthYear } from "../types"
import MonthSelector from "./monthSelector"
import Unallocated from "./unallocated"
import { CentralStoreContext } from "../App"
import { BudgetRow } from "./BudgetRow"

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
      <div class="ml-4 mt-4">
        <div class="mb-2 flex">
          <MonthSelector />
          <Unallocated />
        </div>
        <table class="w-full table-fixed">
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
              {([name, envlp]) => (
                <BudgetRow
                  name={name}
                  envlp={envlp}
                  allocated={getAllocated(state.currentMonth, name)}
                />
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
