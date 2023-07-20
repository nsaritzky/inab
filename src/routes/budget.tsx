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
import {
  getEnvelopes,
  getTransactions,
  getUserFromEmail,
  setAllocation,
} from "~/db"
import {
  Allocated,
  Envelope,
  EnvelopePayload,
  Prisma,
  Transaction,
} from "@prisma/client"
import { coerceToDate, dateToIndex, parseDates, useSession } from "~/utilities"
import { Suspense } from "solid-js"
import { evolve } from "fp-ts/struct"
import { isBefore, parseISO } from "date-fns"
import { updateAt } from "~/utilities"
import { getSession } from "@solid-auth/base"
import { authOpts } from "./api/auth/[...solidauth]"

const ZEROS: number[] = Array(50).fill(0)

interface BudgetProps {}

export const routeData = (props: RouteDataArgs) => {
  const data = createServerData$(async (_, event) => {
    const session = await getSession(event.request, authOpts)
    const user = session?.user
    if (!session || !session.user) {
      throw redirect("/")
    }
    const dbUser = await getUserFromEmail(user?.email!)
    return {
      transactions: await getTransactions(dbUser?.id!),
      envelopes: await getEnvelopes(dbUser?.id!),
      user: dbUser,
    }
  })
  return () => ({
    envelopes: data()?.envelopes?.map((e) => {
      return {
        ...e,
        goals: e.goals.map((g) => ({
          ...g,
          due: coerceToDate(g.due),
        })),
        allocated: e.allocated.reduce(
          (arr, allocated) =>
            updateAt(allocated.monthIndex, allocated.amount)(arr),
          ZEROS
        ),
      }
    }),
    transactions: data()?.transactions?.map((txn) => {
      return {
        ...txn,
        date: coerceToDate(txn.date),
      }
    }),
    user: data()?.user,
  })
}

const Budget: Component<BudgetProps> = (props) => {
  const [state, _] = useContext(CentralStoreContext)!
  const [activeEnvelopeName, setActiveEnvelopeName] = createSignal<string>()
  const [editingGoal, setEditingGoal] = createSignal(false)
  const data = useRouteData<typeof routeData>()

  const [allocating, allocate] = createServerAction$(
    async (form: FormData, { request }) => {
      await setAllocation(
        form.get("userID") as string,
        form.get("envelopeName") as string,
        parseInt(form.get("monthIndex") as string),
        parseFloat(form.get("amount") as string)
      )
    }
  )

  const totalDeposited = () =>
    data()
      .transactions?.filter((txn) => txn.amount > 0)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const totalAllocated = () =>
    data()
      .envelopes?.map((envlp) => envlp.allocated)
      .reduce((acc, arr) => [...acc, ...arr], [])
      .reduce((sum, a) => sum + a, 0)

  const unallocated = () =>
    totalDeposited() != undefined && totalAllocated() != undefined
      ? totalDeposited()! - totalAllocated()!
      : undefined

  const envelopes = () =>
    data().envelopes &&
    data().transactions &&
    Object.values(data().envelopes!).map((envlp) => ({
      ...envlp,
      transactions: data().transactions!.filter(
        (txn) => txn.envelopeName === envlp.name
      ),
    }))

  const activeEnvelope = () =>
    envelopes()?.find((e) => e.name === activeEnvelopeName())

  const activeGoal = () => activeEnvelope()?.goals[0]

  const activity = (envelope: Envelope & { transactions: Transaction[] }) =>
    envelope.transactions
      .filter((txn) => dateToIndex(txn.date) === state.activeMonth)
      .reduce((sum, txn) => sum + txn.amount, 0)

  const monthlyBalances = (
    envelope: Envelope & { transactions: Transaction[]; allocated: number[] }
  ) =>
    envelope.allocated.map(
      (x, i) =>
        x +
        envelope.transactions
          .filter(
            (txn) =>
              dateToIndex(txn.date) == i && txn.envelopeName === envelope.name
          )
          .reduce((sum, txn) => sum + txn.amount, 0)
    )

  const netBalances = (
    envelope: Envelope & { transactions: Transaction[]; allocated: number[] }
  ) =>
    monthlyBalances(envelope).map((_, i) =>
      monthlyBalances(envelope)
        .slice(0, i + 1)
        .reduce((a, b) => a + b, 0)
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
                        userID={data()?.user?.id}
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
                    activeEnvelope()?.allocated[state.activeMonth]!
                  }
                  activityThisMonth={activity(activeEnvelope()!)}
                  activeEnvelope={
                    envelopes()?.find((e) => e.name === activeEnvelopeName())! // TODO better error handling for this
                  }
                  editingGoal={editingGoal()}
                  setEditingGoal={setEditingGoal}
                  userID={data()?.user?.id!}
                />
              </Suspense>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Budget
