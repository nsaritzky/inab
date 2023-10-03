import { Button } from "@kobalte/core"
import { LuciaError } from "lucia"
import { createEffect, Show } from "solid-js"
import { A, useRouteData } from "solid-start"
import {
  ServerError,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import { auth } from "~/auth/lucia"

export const routeData = () => {
  return createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    if (session) {
      console.log("Redirecting from /login to /")
      return redirect("/")
    }
  })
}

const Page = () => {
  const [enrolling, { Form }] = createServerAction$(
    async (formData: FormData) => {
      const email = formData.get("email")
      const password = formData.get("password")
      if (typeof email != "string") {
        throw new ServerError("Invalid email")
      }

      if (typeof password != "string") {
        throw new ServerError("Invalid password")
      }

      try {
        const key = await auth.useKey("email", email?.toLowerCase(), password)
        const session = await auth.createSession({
          userId: key.userId,
          attributes: {},
        })
        const sessionCookie = auth.createSessionCookie(session)
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
          },
        })
      } catch (e) {
        if (
          e instanceof LuciaError &&
          (e.message == "AUTH_INVALID_KEY_ID" ||
            e.message == "AUTH_INVALID_PASSWORD")
        ) {
          throw new ServerError("Invalid email or password")
        } else {
          throw new ServerError("An unknown error ocurred")
        }
      }
    },
  )

  return (
    <div class="bg-gray-100 min-h-screen flex flex-col items-center">
      <div class="mx-2 w-11/12 mt-12 max-w-sm bg-white p-4 rounded-lg flex flex-col items-center shadow">
        <h1 class="text-3xl mb-8 text-center">Login</h1>
        <Form class="w-full">
          <div class="flex flex-col">
            <label class="text-sm" for="email">
              Email
            </label>
            <input
              class="border border-gray-200 rounded"
              name="email"
              id="email"
              type="email"
            />
          </div>
          <br />
          <div class="flex flex-col mb-4">
            <label class="text-sm" for="password">
              Password
            </label>
            <input
              class="border border-gray-200"
              type="password"
              name="password"
              id="password"
            />
          </div>
          <Show when={enrolling.error}>
            <div class="text-red-600">{enrolling.error.message}</div>
          </Show>
          <br />
          <input
            class="w-full p-2 rounded bg-blue-500 text-white cursor-pointer"
            type="submit"
          />
        </Form>

        <a
          href="/auth/google"
          class="px-2 py-1 bg-slate-50 flex rounded mt-4 outline outline-slate-300"
        >
          <img
            class="mr-2"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          />
          Sign in with Google
        </a>

        <div class="mt-4 text-sm text-gray-500">New User?</div>
        <A href="/signup">Sign Up</A>
      </div>
    </div>
  )
}

export default Page
