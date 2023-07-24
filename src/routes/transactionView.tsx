import {
  For,
  Show,
  createEffect,
  createSignal,
  useContext,
  Suspense,
  onMount,
  createMemo,
} from "solid-js"
import { TransactionForm } from "~/components/transactionForm"
import { TransactionRow } from "~/components//transactionRow"
import { AiOutlinePlusCircle } from "solid-icons/ai"
import { CentralStoreContext } from "../root"
import { sort } from "@solid-primitives/signal-builders"
import {
  addTransactions,
  getAccountNames,
  getEnvelopes,
  getTransactions,
  getUserFromEmail,
  updateCursor,
} from "~/db"
import { type RouteDataArgs, useRouteData, refetchRouteData } from "solid-start"
import { compareAsc, compareDesc } from "date-fns"
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import { Transaction } from "@prisma/client"
import { coerceToDate } from "~/utilities"
import { authOpts } from "./api/auth/[...solidauth]"
import { getSession } from "@solid-auth/base"
import { plaidClient } from "~/server/plaidApi"
import {
  bankAccountSync,
  mapTransaction,
  syncTransactions,
} from "~/server/transactionSync"
import { getUser } from "~/server/getUser"
import { isServer } from "solid-js/web"

export const routeData = (props: RouteDataArgs) =>
  createServerData$(async (_, event) => {
    const user = await getUser(event.request)
    /* for (const item of user?.plaidItems || []) {
     *   syncTransactions(item)
     * } */
    const transactions = await getTransactions(user!.id)
    const envelopes = await getEnvelopes(user!.id)
    const accountNames = await getAccountNames(user!.id)
    return { transactions, userId: user!.id, envelopes, accountNames }
  })

const TransactionView = () => {
  const [state, _] = useContext(CentralStoreContext)!
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)
  const [activeIndex, setActiveIndex] = createSignal<number>()
  const rawData = useRouteData<typeof routeData>()
  const data = createMemo(() =>
    rawData()
      ? {
          ...rawData()!,
          transactions: rawData()!.transactions.map((t) => ({
            ...t,
            date: coerceToDate(t.date),
          })),
        }
      : undefined
  )

  const [syncing, sync] = createServerAction$(async (_, event) => {
    const user = await getUser(event.request)
    console.log(user?.plaidItems)
    for (const item of user?.plaidItems || []) {
      syncTransactions(item)
    }
  })

  const envelopeNames = createMemo(() =>
    data()?.envelopes ? data()!.envelopes.map((e) => e.name) : []
  )

  onMount(() => {
    sync()
  })
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
        <Show when={syncing.pending}>Syncing</Show>
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
          <Show when={data()}>
            <Show when={editingNewTransaction()}>
              <TransactionForm
                accountNames={data()!.accountNames}
                userID={data()!.userId}
                setEditingNewTransaction={setEditingNewTransaction}
                deactivate={() => setEditingNewTransaction(false)}
                envelopeList={envelopeNames()}
              />
            </Show>
            <For
              each={sort(data()!.transactions!, (a, b) =>
                compareDesc(a.date, b.date)
              )()}
            >
              {(txn, i) => {
                return (
                  <TransactionRow
                    accountNames={data()!.accountNames}
                    userID={data()!.userId}
                    txn={txn}
                    active={activeIndex() == i()}
                    activate={() => setActiveIndex(i())}
                    deactivate={() => setActiveIndex(-1)}
                    envelopeList={envelopeNames()}
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
