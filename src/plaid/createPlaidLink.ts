import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  untrack,
} from "solid-js"
import { useScript } from "./use-script"

import { createPlaid, PlaidFactory } from "./factory"
import { PlaidLinkOptions, PlaidLinkOptionsWithPublicKey } from "./types"

const PLAID_LINK_STABLE_URL =
  "https://cdn.plaid.com/link/v2/stable/link-initialize.js"

const noop = () => {}

/**
 * This hook loads Plaid script and manages the Plaid Link creation for you.
 * You get easy open & exit methods to call and loading & error states.
 *
 * This will destroy the Plaid UI on un-mounting so it's up to you to be
 * graceful to the user.
 *
 * A new Plaid instance is created every time the token and products options change.
 * It's up to you to prevent unnecessary re-creations on re-render.
 */
export const createPlaidLink = (options: PlaidLinkOptions) => {
  const [loading, error] = useScript(PLAID_LINK_STABLE_URL)

  const [plaid, setPlaid] = createSignal<PlaidFactory>()
  const [iframeLoaded, setIframeLoaded] = createSignal(false)
  const products = createMemo(() =>
    ((options as PlaidLinkOptionsWithPublicKey).product || [])
      .slice()
      .sort()
      .join(",")
  )

  createEffect(() => {
    console.log("anything")
    if (loading()) {
      return
    }

    if (
      !options.token &&
      !(options as PlaidLinkOptionsWithPublicKey).publicKey
    ) {
      return
    }

    if (error() || !window.Plaid) {
      console.error("Error loading Plaid", error())
      return
    }

    if (untrack(plaid) != null) {
      untrack(plaid)!.exit({ force: true }, () => untrack(plaid)!.destroy())
    }

    products()

    const next = createPlaid(
      {
        ...options,
        onLoad: () => {
          setIframeLoaded(true)
          options.onLoad && options.onLoad()
        },
      },
      window.Plaid.create
    )

    setPlaid(next)

    onCleanup(() => {
      next.exit({ force: true }, () => next.destroy())
    })
  })

  const ready = createMemo(() => {
    return plaid() != undefined && (!loading() || iframeLoaded())
  })

  const openNoOp = () => {
    if (!options.token) {
      console.warn(
        "solid-plaid-link: You cannot call open() without a valid token supplied to usePlaidLink. This is a no-op."
      )
    }
  }

  return {
    error: error,
    ready: ready,
    exit: () => (plaid() ? plaid()!.exit : noop),
    open: () => (plaid() ? plaid()!.open : openNoOp),
  }
}
