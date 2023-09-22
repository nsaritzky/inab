import {
  For,
  Show,
  createSignal,
  onMount,
  createMemo,
  Component,
  createEffect,
} from "solid-js"
import { A } from "solid-start"
import { TransactionForm } from "~/components/transactionForm"
import { TransactionRow } from "~/components/transactionRow"
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
import { Pagination, Dialog } from "@kobalte/core"
import FilterBar from "./FilterBar"
import { createStore, reconcile } from "solid-js/store"
import Fuse from "fuse.js"
import Checkbox from "./Checkbox"

const ITEMS_PER_PAGE = 50

interface TransactionViewProps {
  rawData: TransactionsRouteData
}

export interface Filters {
  inflow: boolean
  outflow: boolean
  searchQuery: string
  minAmount?: number
  maxAmount?: number
}

const [dialogOpen, setDialogOpen] = createSignal(false)
const [itemId, setItemId] = createSignal<string>()

const ErrorModal: Component = () => {
  return (
    <Dialog.Root open={dialogOpen()} onOpenChange={setDialogOpen} modal>
      <Dialog.Portal>
        <Dialog.Overlay class="bg-black/20 inset-0 fixed" />
        <div class="inset-0 fixed flex justify-center items-center">
          <Dialog.Content class="bg-white p-4 shadow rounded">
            <div class="flex justify-between">
              <Dialog.Title>Hello</Dialog.Title>
              <Dialog.CloseButton>x</Dialog.CloseButton>
            </div>
            <Dialog.Description>
              The connection to your bank account has expired. Click{" "}
              <A href={`/plaid?accountId=${itemId()}`}>here</A> to reconnect it.
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export const TransactionView: Component<TransactionViewProps> = (props) => {
  const data = createMemo(() =>
    props.rawData
      ? {
        ...props.rawData!,
        transactions: props
          .rawData!.transactions.map((t) => ({
            ...t,
            date: coerceToDate(t.date),
          }))
          .sort((t1, t2) => compareDesc(t1.date, t2.date)),
      }
      : undefined,
  )

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

  const filteredTransactions = createMemo(
    () =>
      data()
        ?.transactions.filter((txn) => txn.amount < 0 || filters.inflow)
        .filter((txn) => txn.amount > 0 || filters.outflow),
  )

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
      ? txns.map((txn) => ({ item: txn, score: 0 }))
      : fuse?.search(filters.searchQuery),
  )

  const filteredTransactionsFinal = createMemo(
    () =>
      filteredTransactions1()
        ?.filter((res) => res.item.amount < 0 || filters.inflow)
        .filter((res) => res.item.amount > 0 || filters.outflow)
        .filter(
          (res) =>
            !filters.minAmount || Math.abs(res.item.amount) > filters.minAmount,
        )
        .filter(
          (res) =>
            !filters.maxAmount || Math.abs(res.item.amount) < filters.maxAmount,
        )
        .sort((a, b) => a.score - b.score),
  )

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

  const [_syncing, sync] = createServerAction$(async (_, event) => {
    const user = await getUser(event.request)
    for (const item of user?.plaidItems || []) {
      if ((await syncTransactions(item)) === "ITEM_LOGIN_REQUIRED") {
        return item.id
      }
    }
  })

  const envelopeNames = createMemo(() =>
    data()?.envelopes ? data()!.envelopes.map((e) => e.name) : [],
  )

  const setChecked = (id: number) => (val: boolean) =>
    setTxns(
      (txn) => txn.id == id,
      (txn) => ({ ...txn, checked: val }),
    )

  onMount(async () => {
    const id = await sync()
    if (id) {
      setItemId(id)
      setDialogOpen(true)
    }
  })

  let paginationRef: HTMLElement | undefined
  return (
    <div class="ml-64 w-auto">
      {" "}
      <div class="ml-4 mt-4 text-sm">
        <ErrorModal />
        <FilterBar filters={filters} setFilters={setFilters} />
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
        <Show when={data()}>
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
                accountNames={data()!.accountNames}
                userID={data()!.userId}
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
                    accountNames={data()!.accountNames}
                    userID={data()!.userId}
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
                  class="px-2 py-1 mx-1 border rounded ui-current:bg-blue-600 ui-current:text-white"
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
              <Pagination.Previous class="px-2 py-1 mr-1 border rounded">
                Prev
              </Pagination.Previous>
              <Pagination.List />
              <Pagination.Next class="px-2 py-1 ml-1 border rounded">
                Next
              </Pagination.Next>
            </Pagination.Root>
          </Show>
          {/* <Pagination
            currentPage={currentPage()}
            totalPages={Math.ceil(data()!.transactions.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          /> */}
        </Show>
      </div>
    </div>
  )
}
