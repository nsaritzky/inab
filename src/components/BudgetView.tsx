import {
  Component,
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  createMemo,
} from "solid-js"
import MonthSelector from "~/components/monthSelector"
import CentralStoreContext from "~/CentralStoreContext"
import Unallocated from "~/components/unallocated"
import { BudgetRow } from "~/components/BudgetRow"
import { BudgetInspector } from "~/components/BudgetInspector"
import { useKeyDownEvent } from "@solid-primitives/keyboard"
import { createServerAction$ } from "solid-start/server"
import { setAllocation } from "../db"
import { Envelope, Transaction } from "@prisma/client"
import { coerceToDate, dateToIndex } from "../utilities"
import { Suspense } from "solid-js"
import { updateAt } from "../utilities"
import type { BudgetRouteData } from "~/routes/budget"

const ZEROS: number[] = Array(50).fill(0)

interface BudgetProps {
  rawData: BudgetRouteData
}

const BudgetView: Component<BudgetProps> = (props) => {
  const [state] = useContext(CentralStoreContext)!
  const [activeEnvelopeName, setActiveEnvelopeName] = createSignal<string>()
  const [editingGoal, setEditingGoal] = createSignal(false)
  const data = createMemo(() =>
    props.rawData
      ? {
          envelopes: props.rawData!.envelopes.map((e) => {
            return {
              ...e,
              goals: e.goals.map((g) => ({
                ...g,
                due: coerceToDate(g.due),
              })),
              allocated: e.allocated.reduce(
                (arr, allocated) =>
                  updateAt(allocated.monthIndex, allocated.amount)(arr),
                ZEROS,
              ),
            }
          }),
          transactions: props.rawData!.transactions?.map((txn) => {
            return {
              ...txn,
              date: coerceToDate(txn.date),
            }
          }),
          user: props.rawData!.user,
        }
      : undefined,
  )

  const [allocating, allocate] = createServerAction$(async (form: FormData) => {
    await setAllocation(
      form.get("userID") as string,
      form.get("envelopeName") as string,
      parseInt(form.get("monthIndex") as string),
      parseFloat(form.get("amount") as string),
    )
  })

  const totalDeposited = () =>
    data()
      ?.transactions?.filter((txn) => txn.amount > 0)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const totalAllocated = () =>
    data()
      ?.envelopes?.map((envlp) => envlp.allocated)
      .reduce((acc, arr) => [...acc, ...arr], [])
      .reduce((sum, a) => sum + a, 0)

  const unallocated = () =>
    totalDeposited() != undefined && totalAllocated() != undefined
      ? totalDeposited()! - totalAllocated()!
      : undefined

  const envelopes = () =>
    data()
      ? data()!.envelopes &&
        data()!.transactions &&
        Object.values(data()!.envelopes).map((envlp) => ({
          ...envlp,
          transactions: data()!.transactions.filter(
            (txn) => txn.envelopeName === envlp.name,
          ),
        }))
      : undefined

  const activeEnvelope = () =>
    envelopes()?.find((e) => e.name === activeEnvelopeName())

  const activeGoal = () => activeEnvelope()?.goals[0]

  const activity = (envelope: Envelope & { transactions: Transaction[] }) =>
    envelope.transactions
      .filter((txn) => dateToIndex(txn.date) === state.activeMonth)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const monthlyBalances = (
    envelope: Envelope & { transactions: Transaction[]; allocated: number[] },
  ) =>
    envelope.allocated.map(
      (x, i) =>
        x +
        envelope.transactions
          .filter(
            (txn) =>
              dateToIndex(txn.date) == i && txn.envelopeName === envelope.name,
          )
          .reduce((sum, txn) => sum + txn.amount, 0),
    )

  const netBalances = (
    envelope: Envelope & { transactions: Transaction[]; allocated: number[] },
  ) =>
    monthlyBalances(envelope).map((_, i) =>
      monthlyBalances(envelope)
        .slice(0, i + 1)
        .reduce((a, b) => a + b, 0),
    )

  const keyDownEvent = useKeyDownEvent()

  createEffect(() => {
    const e = keyDownEvent()
    if (e && activeEnvelopeName()) {
      if (e.key === "Escape") {
        setActiveEnvelopeName()
      }
    }
  })

  return (
    <div class="ml-64">
      <div class="ml-4 mt-4 h-screen">
        <div class="mb-2 flex">
          <MonthSelector />
          <Suspense>
            <Unallocated unallocated={unallocated()} />
          </Suspense>
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
                        active={activeEnvelopeName() == envlp.name}
                        activate={() => {
                          setActiveEnvelopeName(envlp.name)
                          setEditingGoal(false)
                        }}
                        deactivate={() => setActiveEnvelopeName()}
                        setActiveEnvelope={setActiveEnvelopeName}
                        userID={data()!.user.id}
                      />
                    )}
                  </For>
                </tbody>
              </table>
            </Suspense>
          </div>
          <div class="w-1/3 border">
            <Show when={activeEnvelopeName()}>
              <Suspense>
                <BudgetInspector
                  activeGoal={activeGoal()}
                  netBalance={
                    netBalances(activeEnvelope()!).at(state.activeMonth)!
                  }
                  leftoverBalance={
                    netBalances(activeEnvelope()!).at(state.activeMonth - 1)!
                  }
                  allocatedThisMonth={
                    activeEnvelope()!.allocated[state.activeMonth]
                  }
                  activityThisMonth={activity(activeEnvelope()!)}
                  activeEnvelope={activeEnvelope()!}
                  editingGoal={editingGoal()}
                  setEditingGoal={setEditingGoal}
                  userID={data()!.user.id}
                />
              </Suspense>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BudgetView
