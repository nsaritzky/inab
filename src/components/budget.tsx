import { Component, For, createSignal, useContext } from "solid-js"
import type { Month, MonthYear } from "../types"
import MonthSelector from "./monthSelector"
import Unallocated from "./unallocated"
import { CentralStoreContext } from "../App"
import { BudgetRow } from "./BudgetRow"
import { BudgetInspector } from "./BudgetInspector"

interface BudgetProps {
  month: MonthYear
}

export const Budget: Component<BudgetProps> = (props) => {
  const [state, { envelopeBalances }] = useContext(CentralStoreContext)
  const [activeEnvelope, setActiveEnvelope] = createSignal<string>()

  const getAllocated = (my: MonthYear, envlp: string) =>
    Object.keys(state.envelopes[envlp].allocated).includes(my)
      ? state.envelopes[envlp].allocated[my]
      : 0

  return (
    <div class="ml-64">
      <div class="ml-4 mt-4 h-screen">
        <div class="mb-2 flex">
          <MonthSelector />
          <Unallocated />
          <div class="flex-1"></div>
        </div>
        <div class="flex h-full">
          <div class="w-2/3">
            <table class="w-full table-fixed divide-y-2">
              <thead>
                <tr class="text-left">
                  <th>Category</th>
                  <th>Assigned</th>
                  <th>Activity</th>
                  <th>Available</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <For each={Object.entries(state.envelopes)}>
                  {([name, envlp]) => (
                    <BudgetRow
                      name={name}
                      envlp={envlp}
                      allocated={getAllocated(state.currentMonth, name)}
                      setActiveEnvelope={setActiveEnvelope}
                    />
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <div class="w-1/3 border">
            <BudgetInspector activeEnvelope={activeEnvelope} />
          </div>
        </div>
      </div>
    </div>
  )
}
