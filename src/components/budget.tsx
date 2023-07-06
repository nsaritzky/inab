import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
} from "solid-js"
import type { Month, MonthYear } from "../types"
import MonthSelector from "./monthSelector"
import Unallocated from "./unallocated"
import { CentralStoreContext } from "../App"
import { BudgetRow } from "./BudgetRow"
import { BudgetInspector } from "./BudgetInspector"
import { useKeyDownEvent } from "@solid-primitives/keyboard"

interface BudgetProps {}

export const Budget: Component<BudgetProps> = (props) => {
  const [state, _] = useContext(CentralStoreContext)!
  const [activeEnvelope, setActiveEnvelope] = createSignal<string>()
  const [editingGoal, setEditingGoal] = createSignal(false)

  const getAllocated = (monthIndex: number, envlp: string) =>
    state.envelopes[envlp].allocated[monthIndex]

  const keyDownEvent = useKeyDownEvent()

  createEffect(() => {
    const e = keyDownEvent()
    if (e && activeEnvelope()) {
      if (e.key === "Escape") {
        setActiveEnvelope()
      }
    }
  })

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
                      allocated={getAllocated(state.activeMonth, name)}
                      active={activeEnvelope() == name}
                      activate={() => {
                        setActiveEnvelope(name)
                        setEditingGoal(false)
                      }}
                      deactivate={() => setActiveEnvelope()}
                      setActiveEnvelope={setActiveEnvelope}
                    />
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <div class="w-1/3 border">
            <Show when={activeEnvelope()}>
              <BudgetInspector
                activeEnvelope={activeEnvelope()!}
                editingGoal={editingGoal()}
                setEditingGoal={setEditingGoal}
              />
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
