import { Outlet, useRouteData } from "solid-start"
import { Sidebar } from "~/components/sidebar"
import { createServerData$, redirect } from "solid-start/server"
import { auth } from "~/auth/lucia"
import {
  getAccountNames,
  getEnvelopes,
  getEnvelopesWithGoals,
  getTransactions,
  getUserById,
} from "~/db"
import { Suspense, createEffect } from "solid-js"

export const routeData = () =>
  createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    if (!session) {
      throw redirect("login")
    }
    const userId = session.user.userId
    const dbUser = await getUserById(userId)
    const transactions = await getTransactions(userId)
    const envelopes = await getEnvelopesWithGoals(userId)
    const accountNames = await getAccountNames(userId)
    return { transactions, user: dbUser, envelopes, accountNames }
  })

export type AppRouteData = ReturnType<typeof routeData>

const App = () => {
  const data = useRouteData<typeof routeData>()

  return (
    <>
      <Sidebar />
      <div class="ml-64">
        <Suspense>
          <div class="hidden">{`${data()}`}</div>
        </Suspense>
        <Outlet />
      </div>
    </>
  )
}

export default App
