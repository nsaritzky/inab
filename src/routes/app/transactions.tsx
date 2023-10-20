import { type RouteDataArgs, useRouteData, createRouteData } from "solid-start"
import { TransactionView } from "~/components/TransactionView"
import { routeData as appRouteData } from "../app"

export const routeData = ({ data }: RouteDataArgs<typeof appRouteData>) =>
  createRouteData(data)
// createServerData$(async (_, event) => {
//   const authRequest = auth.handleRequest(event.request)
//   const session = await authRequest.validate()
//   if (!session) {
//     console.log("redirecting to login")
//     throw redirect("/login")
//   }
//   const userId = session.user.userId
//   const transactions = await getTransactions(userId)
//   const envelopes = await getEnvelopes(userId)
//   const accountNames = await getAccountNames(userId)
//   return { transactions, userId, envelopes, accountNames }
// })

export type TransactionsRouteData = ReturnType<
  typeof useRouteData<typeof routeData>
>

const Transactions = () => {
  const rawData = useRouteData<typeof routeData>()
  return <TransactionView rawData={rawData()} />
}

export default Transactions
