import { type Accessor, useContext } from "solid-js"
import { CentralStoreContext } from "../App"
import { dateToIndex, displayUSD } from "../utilities"

interface BudgetInspectorProps {
  activeEnvelope: Accessor<string | undefined>
}

export const BudgetInspector = (props: BudgetInspectorProps) => {
  const [state, { netBalance }] = useContext(CentralStoreContext)!

  return (
    <div class="text-md">
      <div class="mx-2">
        <div class="flex justify-between">
          <span class="font-bold">Available Balance</span>
          <span>
            {displayUSD(
              netBalance()[props.activeEnvelope()!][state.activeMonth]
            )}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Leftover from last month</span>
          <span>
            {displayUSD(
              netBalance()[props.activeEnvelope()!][state.activeMonth - 1]
            )}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Assigned this month</span>
          <span>
            {displayUSD(
              state.envelopes[props.activeEnvelope()!].allocated[
                state.activeMonth
              ]
            )}
          </span>
        </div>
        <div class="flex justify-between">
          <span>Activity</span>
          <span>
            {displayUSD(
              state.transactions
                .filter((txn) => dateToIndex(txn.date) == state.activeMonth)
                .filter((txn) => txn.envelope === props.activeEnvelope())
                .reduce((sum, txn) => sum + txn.amount, 0)
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
