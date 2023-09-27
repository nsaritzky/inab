import { createSignal, type Component, Show } from "solid-js"
import { FaSolidCheck, FaSolidMinus } from "solid-icons/fa"
import { Checkbox, TextField, Button } from "@kobalte/core"
import type { Filters } from "./TransactionView"
import { SetStoreFunction, reconcile } from "solid-js/store"
import CurrencyInput from "solid-currency-input-field"
import { VsListFilter } from "solid-icons/vs"

interface Props {
  filters: Filters
  setFilters: SetStoreFunction<Filters>
}

const [minValue, setMinValue] = createSignal<string>()
const [maxValue, setMaxValue] = createSignal<string>()
const [showing, setShowing] = createSignal(false)

const FallbackButton = () => (
  <Button.Root onClick={() => setShowing(true)}>
    <div class="flex items-center">
      <VsListFilter class="mr-2" />
      Filter
    </div>
  </Button.Root>
)

const FilterBar: Component<Props> = (props) => {
  const clearFilters = () => {
    props.setFilters(
      reconcile({
        inflow: true,
        outflow: true,
        searchQuery: "",
      }),
    )
    setMinValue("")
    setMaxValue("")
  }

  return (
    <div class="w-min mb-2 bg-sky-100 p-3 rounded-lg flex">
      <Show when={showing()} fallback={<FallbackButton />}>
        <div class="mr-2">
          <Checkbox.Root
            checked={props.filters.inflow}
            onChange={(v) => props.setFilters("inflow", v)}
            defaultChecked
            class="flex items-center"
          >
            <Checkbox.Input />
            <Checkbox.Control class="h-4 w-4 border rounded bg-white ui-checked:bg-blue-600">
              <Checkbox.Indicator>
                <FaSolidCheck fill="white" />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="ml-2">Inflow</Checkbox.Label>
          </Checkbox.Root>
          <Checkbox.Root
            checked={props.filters.outflow}
            onChange={(v) => props.setFilters("outflow", v)}
            defaultChecked
            class="flex items-center"
          >
            <Checkbox.Input />
            <Checkbox.Control class="h-4 w-4 border rounded bg-white ui-checked:bg-blue-600 ui-checked:text-white">
              <Checkbox.Indicator>
                <FaSolidCheck fill="white" />
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label class="ml-2">Outflow</Checkbox.Label>
          </Checkbox.Root>
        </div>

        <div class="flex flex-col ml-2">
          <label for="minAmount">Minimum Amount</label>
          <CurrencyInput
            class="rounded p-1 h-5"
            decimalsLimit={2}
            decimalScale={2}
            prefix="$"
            type="text"
            name="minAmount"
            value={minValue()}
            onValueChange={(val, _, vals) => {
              props.setFilters("minAmount", vals?.float || 0)
              setMinValue(val)
            }}
          />
          <label for="maxAmount">Maximum Amount</label>
          <CurrencyInput
            class="rounded p-1 h-5"
            decimalsLimit={2}
            decimalScale={2}
            prefix="$"
            type="text"
            name="maxAmount"
            value={maxValue()}
            onValueChange={(val, _, vals) => {
              props.setFilters("maxAmount", vals?.float || Infinity)
              setMaxValue(val)
            }}
          />
        </div>
        <div class="flex flex-col splace-between h-full">
          <TextField.Root
            value={props.filters.searchQuery}
            onChange={(v) => props.setFilters("searchQuery", v)}
            class="flex flex-col pl-2"
          >
            <TextField.Label class="mr-2">Query</TextField.Label>
            <TextField.Input />
          </TextField.Root>
          <Button.Root class="mt-4 place-self-end" onClick={clearFilters}>
            clear
          </Button.Root>
        </div>
        <Button.Root
          title="Close Filter Bar"
          class="self-start"
          onClick={() => setShowing(false)}
        >
          <FaSolidMinus />
        </Button.Root>
      </Show>
    </div>
  )
}

export default FilterBar
