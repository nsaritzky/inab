import { type Accessor, useContext } from "solid-js"
import { CentralStoreContext } from "../App"

interface BudgetInspectorProps {
  activeEnvelope: Accessor<string | undefined>
}

export const BudgetInspector = (props: BudgetInspectorProps) => {
  const [store, { netBalance }] = useContext(CentralStoreContext)
  const envelopeBalance = () => {
    const envlp = props.activeEnvelope()
    return envlp
      ? store.envelopes[envlp].allocated[store.currentMonth].toLocaleString(
          "en-us",
          { style: "currency", currency: "USD" }
        )
      : 0
  }

  return (
    <div class="text-sm">
      <div class="mx-2 flex justify-between">
        <span class="font-bold">Available Balance</span>
        <span>{netBalance()[props.activeEnvelope()][store.currentMonth]}</span>
      </div>
    </div>
  )
}
