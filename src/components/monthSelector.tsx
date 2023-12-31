import { type Component, createSignal, useContext, For } from "solid-js"
import CentralStoreContext from "~/CentralStoreContext"
import { Popover, Separator } from "@kobalte/core"
import { DAY_ONE } from "../store"
import { ChevronDown, ChevronRight, ChevronLeft, X } from "lucide-solid"

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const

type Month = (typeof MONTHS)[number]

interface PopupProps {
  activeMonth: Month
  currentYear: number
  currentMonth: number
  setMonth: (i: number) => void
}

const MonthPopover: Component<PopupProps> = (props) => {
  const [year, setYear] = createSignal(props.currentYear)
  const toMonthIndex = (month: Month, year: number) =>
    MONTHS.indexOf(month) +
    12 * year -
    DAY_ONE.getMonth() -
    12 * DAY_ONE.getFullYear()
  return (
    <div>
      <div class="flex justify-between">
        <div class="mx-2 flex w-full justify-center">
          <button onClick={() => setYear((y) => y - 1)}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <button>{year()}</button>
          </div>
          <button onClick={() => setYear((y) => y + 1)}>
            <ChevronRight size={24} />
          </button>
        </div>
        <Popover.CloseButton>
          <X />
        </Popover.CloseButton>
      </div>
      <Separator.Root orientation="horizontal" class="h-1 w-full" />
      <div class="grid grid-cols-4">
        <For each={MONTHS}>
          {(month) => (
            <button
              onClick={() => props.setMonth(toMonthIndex(month, year()))}
              class={`${
                month == props.activeMonth && year() == props.currentYear
                  ? "bg-blue-500 text-white"
                  : toMonthIndex(month, year()) == props.currentMonth
                  ? "bg-slate-300 text-blue-500"
                  : "hover:bg-slate-200"
              } m-2 rounded p-1`}
            >
              {month}
            </button>
          )}
        </For>
      </div>
    </div>
  )
}

const MonthSelector: Component = () => {
  const [state, { setDecMonth, setIncMonth, setMonth }] =
    useContext(CentralStoreContext)!
  const activeMonth = () => MONTHS[state.activeMonth % 12]
  const currentYear = () =>
    DAY_ONE.getFullYear() + Math.floor(state.activeMonth / 12)

  return (
    <div class="align-center flex h-8">
      <button
        aria-label="previous month"
        onClick={(e) => {
          e.preventDefault()
          setDecMonth()
        }}
      >
        <ChevronLeft size={24} />
      </button>
      <Popover.Root>
        <Popover.Trigger>
          <div class="flex items-center">
            <div class="w-20">{`${activeMonth()} ${currentYear()}`}</div>
            <ChevronDown size={24} />
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            aria-label="month selector"
            class="rounded bg-gray-50 shadow-xl"
          >
            <Popover.Arrow />
            <div class="flex">
              <MonthPopover
                activeMonth={activeMonth()}
                currentMonth={state.currentMonth}
                currentYear={currentYear()}
                setMonth={setMonth}
              />
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <button
        aria-label="next month"
        onClick={(e) => {
          e.preventDefault()
          setIncMonth()
        }}
      >
        <ChevronRight size={24} />
      </button>
    </div>
  )
}

export default MonthSelector
