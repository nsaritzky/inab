import { For, Suspense, type Component, Show } from "solid-js"
import { type RouteDataArgs, createRouteData, useRouteData } from "solid-start"
import { routeData as appRouteData } from "~/routes/app"
import AccountRow from "~/components/AccountRow"
import { BankAccount } from "@prisma/client"

export const routeData = ({ data }: RouteDataArgs<typeof appRouteData>) =>
  createRouteData(data)

const Page: Component = () => {
  const data = useRouteData<typeof routeData>()
  const balance = (acct: BankAccount) =>
    data()
      ?.transactions.filter((t) => t.bankAccount.id == acct.id)
      .reduce((acc, t) => acc + t.amount, 0)
  return (
    <Suspense fallback={<div>fallback</div>}>
      <For each={data()?.bankAccounts}>
        {(account) => (
          <AccountRow account={account} balance={balance(account)!} />
        )}
      </For>
    </Suspense>
  )
}

export default Page
