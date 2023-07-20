import {
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  Suspense,
} from "solid-js"
import { TransactionForm } from "~/components/transactionForm"
import { TransactionRow } from "~/components//transactionRow"
import { AiOutlinePlusCircle } from "solid-icons/ai"
import { CentralStoreContext } from "../root"
import { sort } from "@solid-primitives/signal-builders"
import { getTransactions, getUserFromEmail } from "~/db"
import { type RouteDataArgs, useRouteData } from "solid-start"
import { compareAsc, compareDesc } from "date-fns"
import { createServerData$ } from "solid-start/server"
import { Transaction } from "@prisma/client"
import { coerceToDate } from "~/utilities"
import { authOpts } from "./api/auth/[...solidauth]"
import { getSession } from "@solid-auth/base"
import { plaidClient } from "~/server/plaidApi"

export const routeData = (props: RouteDataArgs) => {
  const data = createServerData$(async (_, event) => {
    const session = await getSession(event.request, authOpts)
    const user = session?.user
    if (!session || !user) {
      throw redirect("/")
    }
    const dbUser = await getUserFromEmail(user?.email!)
    const transactions = await getTransactions(dbUser?.id!)
    return { transactions, user: dbUser }
  })
  return () => ({
    transactions: data()?.transactions.map((t) => ({
      ...t,
      date: coerceToDate(t.date),
    })),
    user: data()?.user,
  })
}

const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)!
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)
  const [activeIndex, setActiveIndex] = createSignal<number>()
  const data = useRouteData<typeof routeData>()

  return (
    <div class="ml-64 w-auto">
      <div class="ml-4 mt-4 text-sm">
        <button
          onClick={(e) => {
            e.preventDefault()
            setEditingNewTransaction(true)
          }}
        >
          <div class="flex">
            <AiOutlinePlusCircle size={24} /> Add transaction
          </div>
        </button>
        <div
          class="table w-auto table-fixed divide-y"
          role="table"
          aria-label="Transactions"
        >
          <div class="flex table-header-group text-left" role="row">
            <div class="table-cell w-14">Inflow</div>
            <div class="table-cell w-14">Outflow</div>
            <div class="table-cell w-28">Date</div>
            <div class="table-cell w-20">Payee</div>
            <div class="table-cell w-36">Envelope</div>
            <div class="table-cell w-20">Account</div>
            <div class="table-cell w-20">Description</div>
          </div>
          <Show when={editingNewTransaction()}>
            <TransactionForm
              userID={data().user?.id}
              setEditingNewTransaction={setEditingNewTransaction}
              deactivate={() => setEditingNewTransaction(false)}
            />
          </Show>

          <Show when={data().transactions}>
            <For
              each={sort(data().transactions!, (a, b) =>
                compareDesc(a.date, b.date)
              )()}
            >
              {(txn, i) => {
                console.log(txn)
                return (
                  <TransactionRow
                    userID={data().user?.id!}
                    txn={txn}
                    active={activeIndex() == i()}
                    activate={() => setActiveIndex(i())}
                    deactivate={() => setActiveIndex(-1)}
                  />
                )
              }}
            </For>
          </Show>
        </div>
      </div>
    </div>
  )
}

export default TransactionView
