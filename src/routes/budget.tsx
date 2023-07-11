import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
} from "solid-js"
import type { Month, MonthYear } from "~/types"
import MonthSelector from "~/components/monthSelector"
import Unallocated from "~/components/unallocated"
import { CentralStoreContext } from "~/root"
import { BudgetRow } from "~/components/BudgetRow"
import { BudgetInspector } from "~/components/BudgetInspector"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import { useRouteData, type RouteDataArgs } from "solid-start"
import { createServerAction$, createServerData$ } from "solid-start/server"
import { getEnvelopes, setAllocation } from "~/db"
import { Envelope, EnvelopePayload, Prisma, Transaction } from "@prisma/client"
import { coerceToDate, dateToIndex, parseDates } from "~/utilities"
import { Suspense } from "solid-js"
import { evolve } from "fp-ts/struct"
import { parseISO } from "date-fns"
import { updateAt } from "~/utilities"

const ZEROS: number[] = Array(50).fill(0)

interface BudgetProps {}

export const routeData = (props: RouteDataArgs) => {
  const records = createServerData$(getEnvelopes)

  return () =>
    records()?.map((e) => ({
      ...e,
      transactions: e.transactions.map((txn) => ({
        ...txn,
        date: coerceToDate(txn.date),
      })),
      goals: e.goals.map((g) => ({
        ...g,
        begin: coerceToDate(g.begin),
        due: coerceToDate(g.due),
      })),
      allocated: e.allocated.reduce(
        (arr, allocated) =>
          updateAt(allocated.monthIndex, allocated.amount)(arr),
        ZEROS
      ),
    }))
}

const Budget: Component<BudgetProps> = (props) => {
  const [state, _] = useContext(CentralStoreContext)!
  const [activeEnvelope, setActiveEnvelope] = createSignal<string>()
  const [editingGoal, setEditingGoal] = createSignal(false)
  const envelopes = useRouteData<typeof routeData>()

  const [allocating, allocate] = createServerAction$(
    async (form: FormData, { request }) => {
      await setAllocation(
        form.get("envelopeName") as string,
        parseInt(form.get("monthIndex") as string),
        parseFloat(form.get("amount") as string)
      )
    }
  )

  const envelopeMonthlyTotal = (
    envelope: Envelope & { transactions: Transaction[] }
  ) =>
    envelope.transactions
      .filter((txn) => dateToIndex(txn.date) === state.activeMonth)
      .reduce((sum, txn) => sum + txn.amount, 0)

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
            <Suspense>
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
                  <For each={envelopes()}>
                    {(envlp) => (
                      <BudgetRow
                        name={envlp.name}
                        envelope={envlp}
                        Form={allocate.Form}
                        active={activeEnvelope() == envlp.name}
                        activate={() => {
                          setActiveEnvelope(envlp.name)
                          setEditingGoal(false)
                        }}
                        deactivate={() => setActiveEnvelope()}
                        setActiveEnvelope={setActiveEnvelope}
                      />
                    )}
                  </For>
                </tbody>
              </table>
            </Suspense>
          </div>
          <div class="w-1/3 border">
            <Show when={activeEnvelope()}>
              {/* <BudgetInspector
                activeEnvelope={activeEnvelope()!}
                editingGoal={editingGoal()}
                setEditingGoal={setEditingGoal}
              /> */}
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Budget
