import { Outlet, useRouteData } from "solid-start"
import { Sidebar } from "~/components/sidebar"
import {
  createServerData$,
  createServerAction$,
  redirect,
} from "solid-start/server"
import { auth } from "~/auth/lucia"
import {
  getAccountNames,
  getEnvelopesWithGoals,
  getTransactions,
  getUserById,
} from "~/db"
import { Suspense, createEffect, createSignal, onMount } from "solid-js"
import { syncTransactions } from "~/server/transactionSync"
import SyncErrorModal from "~/components/SyncErrorModal"

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

  const [dialogOpen, setDialogOpen] = createSignal(false)
  const [itemId, setItemId] = createSignal<string>()

  const [syncing, sync] = createServerAction$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    if (!session) {
      throw redirect("login")
    }
    const user = await getUserById(session.user.userId)
    for (const item of user?.plaidItems || []) {
      if ((await syncTransactions(item)) === "ITEM_LOGIN_REQUIRED") {
        return item.id
      }
    }
  })

  onMount(async () => {
    const id = await sync()
    if (id) {
      setItemId(id)
      setDialogOpen(true)
    }
  })

  return (
    <>
      <Sidebar />
      <div class="ml-64">
        <SyncErrorModal
          dialogOpen={dialogOpen()}
          setDialogOpen={setDialogOpen}
          itemId={itemId()}
        />
        <Suspense>
          <div class="hidden">{`${data()}`}</div>
        </Suspense>
        <Outlet />
      </div>
    </>
  )
}

export default App
