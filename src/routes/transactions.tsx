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

import { getAccountNames, getEnvelopes, getTransactions } from "~/db"
import { type RouteDataArgs, useRouteData, refetchRouteData } from "solid-start"
import { createServerData$ } from "solid-start/server"
import {
  bankAccountSync,
  mapTransaction,
  syncTransactions,
} from "~/server/transactionSync"
import { getUser } from "~/server/getUser"
import { TransactionView } from "~/components/TransactionView"

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

export type TransactionsRouteData = ReturnType<
  ReturnType<typeof useRouteData<typeof routeData>>
>
const Transactions = () => {
  const rawData = useRouteData<typeof routeData>()
  return <TransactionView rawData={rawData()} />
}

export default Transactions
