import {
  For,
  Show,
  createSignal,
  onMount,
  createMemo,
  Component,
} from "solid-js"
import { TransactionForm } from "~/components/transactionForm"
import { TransactionRow } from "~/components//transactionRow"
import { AiOutlinePlusCircle } from "solid-icons/ai"
import { sort } from "@solid-primitives/signal-builders"
import {
  addTransactions,
  getAccountNames,
  getEnvelopes,
  getTransactions,
  getUserFromEmail,
  updateCursor,
} from "~/db"
import { compareAsc, compareDesc } from "date-fns"
import { createServerAction$ } from "solid-start/server"
import { coerceToDate } from "~/utilities"
import { syncTransactions } from "~/server/transactionSync"
import { getUser } from "~/server/getUser"
import { TransactionsRouteData } from "~/routes/transactions"
import Pagination from "./Pagination"

interface TransactionViewProps {
  rawData: TransactionsRouteData
}

export const TransactionView: Component<TransactionViewProps> = (props) => {
  const data = createMemo(() =>
    props.rawData
      ? {
          ...props.rawData!,
          transactions: props.rawData!.transactions.map((t) => ({
            ...t,
            date: coerceToDate(t.date),
          })),
        }
      : undefined
  )
  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)
  const [activeIndex, setActiveIndex] = createSignal<number>()
  const itemsPerPage = 50
  const [currentPage, setCurrentPage] = createSignal(1)
  const startIndex = createMemo(() => (currentPage() - 1) * itemsPerPage)
  const endIndex = createMemo(() => startIndex() + itemsPerPage)
  const pageItems = createMemo(() =>
    data()?.transactions.slice(startIndex(), endIndex())
  )

  const [syncing, sync] = createServerAction$(async (_, event) => {
    const user = await getUser(event.request)
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
      {" "}
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
              each={sort(pageItems()!, (a, b) => compareDesc(a.date, b.date))()}
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
            <Pagination
              currentPage={currentPage()}
              totalPages={Math.ceil(data()!.transactions.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}
