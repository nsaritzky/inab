import {
  For,
  Show,
  createSignal,
  createMemo,
  Component,
  createEffect,
  Suspense,
} from "solid-js"
import { TransactionForm } from "~/components/transactionForm"
import { TransactionRow } from "~/components/transactionRow"
import { PlusCircle, Loader2 } from "lucide-solid"
import { filter, sort } from "@solid-primitives/signal-builders"
import { compareDesc } from "date-fns"
import { type TransactionsRouteData } from "~/routes/app/transactions"
import { Pagination } from "@kobalte/core"
import FilterBar from "./FilterBar"
import { createStore, reconcile, unwrap } from "solid-js/store"
import Fuse from "fuse.js"
import Checkbox from "./Checkbox"
import { useLocation, useSearchParams } from "solid-start"
import { coerceToDate } from "~/utilities"

const ITEMS_PER_PAGE = 50

interface TransactionViewProps {
  rawData: ReturnType<TransactionsRouteData>
}

export interface Filters {
  inflow: boolean
  outflow: boolean
  searchQuery: string
  bankAccount?: string
  minAmount?: number
  maxAmount?: number
}

const [dialogOpen, setDialogOpen] = createSignal(false)
const [itemId, setItemId] = createSignal<string>()

export const TransactionView: Component<TransactionViewProps> = (props) => {
  const data = createMemo(() =>
    props.rawData
      ? {
          ...props.rawData,
          transactions: props.rawData.transactions
            .map((t) => ({
              ...t,
              date: coerceToDate(t.date),
            }))
            .sort((t1, t2) => compareDesc(t1.date, t2.date)),
        }
      : undefined,
  )

  const [searchParams, setSearchParams] = useSearchParams()

  // createEffect(() => {
  //   setSearchParams({
  //     inflow: `${filters.inflow}`,
  //     outflow: `${filters.outflow}`,
  //     searchQuery: `${filters.searchQuery}`,
  //     bankAccount: `${filters.bankAccount}`,
  //     minAmount: `${filters.minAmount}`,
  //     maxAmount: `${filters.maxAmount}`,
  //   })
  // })

  // createEffect(() => {
  //   setFilters(
  //     reconcile({
  //       inflow: Boolean(searchParams.inflow),
  //       outflow: Boolean(searchParams.outflow),
  //       searchQuery: searchParams.searchQuery,
  //       bankAccount: searchParams.bankAccount,
  //       minAmount: parseFloat(searchParams.minAmount),
  //       maxAmount: parseFloat(searchParams.maxAmount),
  //     }),
  //   )
  // })

  const [filters, setFilters] = createStore<Filters>({
    inflow: true,
    outflow: true,
    searchQuery: "",
  })

  const [txns, setTxns] = createStore(
    data()?.transactions.map((txn) => ({
      ...txn,
      checked: false,
    })) || [],
  )

  createEffect(() => {
    setTxns(
      reconcile(
        data()?.transactions.map((txn) => ({ ...txn, checked: false })) || [],
      ),
    )
  })

  const fuseOptions: Fuse.IFuseOptions<{}> = {
    includeScore: true,
    keys: ["description", "payee", "bankAccount.name", "envelopeName"],
  }
  const fuse = new Fuse(txns || [], fuseOptions)

  // If the transaction list is updated, then update fuse data
  createEffect(() => {
    fuse.setCollection(txns || [])
  })

  const filteredTransactions1 = createMemo(() =>
    filters.searchQuery == ""
      ? txns.map((txn) => ({ item: txn }))
      : fuse.search(filters.searchQuery),
  )

  const filteredTransactionsFinal = sort(
    filter(
      filteredTransactions1,
      (res) =>
        (!searchParams.bankAccount ||
          res.item.bankAccount.id.toString() == searchParams.bankAccount) &&
        (res.item.amount < 0 || filters.inflow) &&
        (res.item.amount > 0 || filters.outflow) &&
        (!filters.minAmount || Math.abs(res.item.amount) > filters.minAmount) &&
        (!filters.maxAmount || Math.abs(res.item.amount) < filters.maxAmount),
    ),
    (a, b) => a.score - b.score,
  )

  // const filteredTransactionsFinal = createMemo(() =>
  //   searchParams.bankAccount
  //     ? filteredTransactions2().filter(
  //         (item) =>
  //           item.item.bankAccount.id.toString() === searchParams.bankAccount,
  //       )
  //     : filteredTransactions2(),
  // )

  // Uncheck transactions when they're filtered out
  createEffect(() => {
    setTxns(
      (txn) =>
        !filteredTransactionsFinal()
          .map((t) => t.item.id)
          .includes(txn.id),
      "checked",
      false,
    )
  })

  const [allChecked, setAllChecked] = createSignal(false)
  const onSetAllChecked = (v: boolean) => {
    setAllChecked(v)
    setTxns(
      (txn) =>
        filteredTransactionsFinal()
          .map((t) => t.item.id)
          .includes(txn.id),
      "checked",
      v,
    )
  }

  const [editingNewTransaction, setEditingNewTransaction] = createSignal(false)
  const [activeIndex, setActiveIndex] = createSignal<number>()
  const [currentPage, setCurrentPage] = createSignal(1)
  const startIndex = () => (currentPage() - 1) * ITEMS_PER_PAGE
  const endIndex = () => startIndex() + ITEMS_PER_PAGE
  const pageCount = () =>
    Math.max(Math.ceil(filteredTransactionsFinal()!.length / ITEMS_PER_PAGE), 1)
  const pageItems = createMemo(
    () =>
      filteredTransactionsFinal()
        ?.map((res) => res.item)
        .slice(startIndex(), endIndex()),
  )

  // const [syncing, sync] = createServerAction$(async (_, event) => {
  //   const authRequest = auth.handleRequest(event.request)
  //   const session = await authRequest.validate()
  //   if (!session) {
  //     throw redirect("login")
  //   }
  //   const user = await getUserById(session.user.userId)
  //   for (const item of user?.plaidItems || []) {
  //     if ((await syncTransactions(item)) === "ITEM_LOGIN_REQUIRED") {
  //       return item.id
  //     }
  //   }
  // })

  // onMount(async () => {
  //   const id = await sync()
  //   if (id) {
  //     setItemId(id)
  //     setDialogOpen(true)
  //   }
  // })

  const envelopeNames = createMemo(() =>
    data()?.envelopes ? data()!.envelopes!.map((e) => e.name) : [],
  )

  const setChecked = (id: number) => (val: boolean) =>
    setTxns(
      (txn) => txn.id == id,
      (txn) => ({ ...txn, checked: val }),
    )

  let paginationRef: HTMLElement | undefined
  return (
    <div class="w-auto">
      {" "}
      <div class="ml-4 mt-4 pt-4 text-sm">
        <FilterBar filters={filters} setFilters={setFilters} />
        <button
          onClick={(e) => {
            e.preventDefault()
            setEditingNewTransaction(true)
          }}
        >
          <div class="flex">
            <PlusCircle size={24} /> Add transaction
          </div>
        </button>
        <Suspense fallback={<Loader2 />}>
          <div
            class="table table-fixed divide-y w-full"
            role="table"
            aria-label="Transactions"
          >
            <div class="flex table-header-group text-left" role="row">
              <div class="table-cell w-8">
                <Checkbox checked={allChecked()} onChange={onSetAllChecked} />
              </div>
              <div class="table-cell w-8" />
              <div class="table-cell w-20">Inflow</div>
              <div class="table-cell w-20">Outflow</div>
              <div class="table-cell w-24">Date</div>
              <div class="table-cell w-1/6">Payee</div>
              <div class="table-cell w-1/6">Envelope</div>
              <div class="table-cell w-1/6">Account</div>
              <div class="table-cell w-1/6">Description</div>
            </div>
            <Show when={editingNewTransaction()}>
              <TransactionForm
                accountNames={data()!.bankAccounts.map(
                  (acct) => acct.userProvidedName || acct.name,
                )}
                userID={data()!.user.id}
                setEditingNewTransaction={setEditingNewTransaction}
                deactivate={() => setEditingNewTransaction(false)}
                envelopeList={envelopeNames()}
                newTransaction
              />
            </Show>
            <For each={pageItems()}>
              {(txn, i) => {
                return (
                  <TransactionRow
                    accountNames={data()!.bankAccounts.map((acct) => acct.name)}
                    userID={data()!.user.id}
                    checked={txn.checked}
                    setChecked={setChecked(txn.id)}
                    txn={txn}
                    active={activeIndex() == i()}
                    activate={() => setActiveIndex(i())}
                    deactivate={() => setActiveIndex(-1)}
                    envelopeList={envelopeNames()}
                  />
                )
              }}
            </For>
          </div>
          <Show when={filteredTransactionsFinal()!.length > 0}>
            <Pagination.Root
              ref={paginationRef}
              class="mt-4 mb-2 [&>ul]:flex"
              count={pageCount()}
              page={currentPage()}
              onPageChange={(page) => {
                setCurrentPage(page)
                // Scroll pagination into view in case if fell off the end of the window
                // going from a short page to a long one
                paginationRef?.scrollIntoView()
              }}
              itemComponent={(props) => (
                <Pagination.Item
                  class="px-2 py-1 mx-1 border rounded ui-current:bg-sky-600 ui-current:text-white"
                  page={props.page}
                >
                  {props.page}
                </Pagination.Item>
              )}
              ellipsisComponent={() => (
                <Pagination.Ellipsis class="px-2 py-1 mx-1 border rounded">
                  ...
                </Pagination.Ellipsis>
              )}
            >
              <Pagination.Previous class="px-2 py-1 mr-1 border rounded ui-disabled:text-gray-400">
                Prev
              </Pagination.Previous>
              <Pagination.List />
              <Pagination.Next class="px-2 py-1 ml-1 border rounded ui-disabled:text-gray-400">
                Next
              </Pagination.Next>
            </Pagination.Root>
          </Show>
        </Suspense>
      </div>
    </div>
  )
}
