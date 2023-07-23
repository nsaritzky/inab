import { getSession } from "@solid-auth/base"
import { createEffect, createMemo, createSignal, onMount } from "solid-js"
import { createRouteData, useRouteData } from "solid-start"
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import { getUserFromEmail, savePlaidItemFn } from "~/db"
import { PlaidLinkOptions, PlaidLinkOnSuccess } from "~/plaid"
import { createPlaidLink } from "~/plaid/createPlaidLink"
import { authOpts } from "./api/auth/[...solidauth]"
import { plaidClient } from "~/server/plaidApi"
const SANDBOX_URL = "https://sandbox.plaid.com"
/*
 * export const useUser = async (request: Request) => {
 *   const session = await getSession(request, authOpts)
 *   const user = session?.user
 *   if (!session || !user) {
 *     throw redirect("/")
 *   }
 *   return (await getUserFromEmail(user?.email!))?.id
 * } */

export const routeData = () =>
  createServerData$(async (_, event) => {
    const session = await getSession(event.request, authOpts)
    const user = session?.user
    if (!session || !user) {
      throw redirect("/")
    }
    const userId = (await getUserFromEmail(user?.email!))?.id
    const data = {
      client_name: "flite",
      secret: process.env.PLAID_CLIENT_SECRET,
      client_id: process.env.PLAID_CLIENT_ID,
      language: "en",
      country_codes: ["US"],
      products: ["transactions"],
      user: {
        client_user_id: "user_id",
      },
    }
    const response = await fetch(
      "https://sandbox.plaid.com/link/token/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    )
    const responseData = await response.json()
    return { linkToken: responseData.link_token as string, userId }
  })

const PlaidLink = () => {
  const data = useRouteData<typeof routeData>()

  const [exchanging, exchange] = createServerAction$(
    async (public_token: string, event) => {
      const session = await getSession(event.request, authOpts)
      const user = session?.user
      if (!session || !user) {
        throw redirect("/")
      }
      const userId = (await getUserFromEmail(user?.email!))?.id
      const response = await fetch(
        `${SANDBOX_URL}/item/public_token/exchange`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secret: process.env.PLAID_CLIENT_SECRET,
            client_id: process.env.PLAID_CLIENT_ID,
            public_token,
          }),
        }
      )
      const responseData = await response.json()
      const accountsResponse = await plaidClient.accountsGet({
        access_token: responseData.access_token,
      })
      console.log(accountsResponse.data)
      await savePlaidItemFn(
        responseData.access_token,
        responseData.item_id,
        userId!,
        accountsResponse.data.accounts
      )
      console.log(responseData)
    }
  )

  createEffect(() => {
    /* setToken(link_token()) */
  })

  const onSuccess: PlaidLinkOnSuccess = (publicToken, metadata) => {
    console.log(publicToken)
    exchange(publicToken)
  }

  const config = createMemo(
    (): PlaidLinkOptions => ({
      token: data()?.linkToken!,
      onSuccess,
    })
  )

  const { ready, error, open, exit } = createPlaidLink(config())

  return (
    <div class="ml-64 w-auto">
      <button onClick={() => open()()} disabled={!ready()}>
        Connect
      </button>
    </div>
  )
}

export default PlaidLink
