import { getSession } from "@solid-auth/base"
import { createEffect, createMemo, createSignal, onMount } from "solid-js"
import { createRouteData, useRouteData, useSearchParams } from "solid-start"
import {
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import { getAccessToken, getUserFromEmail, savePlaidItemFn } from "~/db"
import type { PlaidLinkOptions, PlaidLinkOnSuccess } from "~/plaid"
import { createPlaidLink } from "~/plaid/createPlaidLink"
import { authOpts } from "./api/auth/[...solidauth]"
import { plaidClient } from "~/server/plaidApi"
const SANDBOX_URL = "https://sandbox.plaid.com"
const TOKEN_CREATE_URL = "https://sandbox.plaid.com/link/token/create"
/*
 * export const useUser = async (request: Request) => {
 *   const session = await getSession(request, authOpts)
 *   const user = session?.user
 *   if (!session || !user) {
 *     throw redirect("/")
 *   }
 *   return (await getUserFromEmail(user?.email!))?.id
 * } */

export const routeData = () => {
  const [searchParams] = useSearchParams()
  return createServerData$(
    async (accountId, event) => {
      const session = await getSession(event.request, authOpts)
      const user = session?.user
      const userId = (await getUserFromEmail(user?.email!))?.id
      // If an accountId is given, then get a Link token in update mode
      if (accountId != "NO_ID") {
        const access_token = await getAccessToken(accountId)
        const data = {
          client_name: "flite",
          access_token,
          secret: process.env.PLAID_CLIENT_SECRET,
          client_id: process.env.PLAID_CLIENT_ID,
          language: "en",
          country_codes: ["US"],
          user: {
            client_user_id: userId,
          },
        }
        const response = await fetch(TOKEN_CREATE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
        const responseData = await response.json()

        return { linkToken: responseData.link_token as string, userId }
      } else {
        if (!session || !user) {
          throw redirect("/")
        }
        const data = {
          client_name: "flite",
          secret: process.env.PLAID_CLIENT_SECRET,
          client_id: process.env.PLAID_CLIENT_ID,
          language: "en",
          country_codes: ["US"],
          products: ["transactions"],
          user: {
            client_user_id: userId,
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
          },
        )
        const responseData = await response.json()
        return { linkToken: responseData.link_token as string, userId }
      }
    },
    // Data function doesn't run at all if key is falsy, so we need to give it
    // a truthy value for the no-id case
    { key: () => searchParams.accountId || "NO_ID" },
  )
}

const PlaidLink = () => {
  const data = useRouteData<typeof routeData>()
  const [searchParams] = useSearchParams()
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
        },
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
        accountsResponse.data.accounts,
      )
      console.log(responseData)
    },
  )

  const onSuccess: PlaidLinkOnSuccess = (publicToken, _metadata) => {
    console.log(publicToken)
    if (!searchParams.accountId) {
      exchange(publicToken)
    }
  }

  const config = createMemo(
    (): PlaidLinkOptions => ({
      token: data()?.linkToken!,
      onSuccess,
    }),
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
