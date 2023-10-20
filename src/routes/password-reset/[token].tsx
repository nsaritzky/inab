import { generateRandomString, isWithinExpiration } from "lucia/utils"
import { type Component, Show, createEffect } from "solid-js"
import {
  useParams,
  ErrorBoundary,
  type RouteDataArgs,
  useRouteData,
  createRouteData,
} from "solid-start"
import {
  ServerError,
  createServerAction$,
  createServerData$,
} from "solid-start/server"
import { auth } from "~/auth/lucia"
import {
  getPasswordResetTokens,
  retrievePasswordResetToken,
  savePasswordResetToken,
} from "~/db"
import { validatePasswordResetToken } from "~/token"

export const routeData = ({ params }: RouteDataArgs) =>
  createServerData$(
    async (token) => {
      try {
        const userId = await validatePasswordResetToken(token)
        return { userId, errorMessage: undefined }
      } catch (e) {
        if (e instanceof Error) {
          return { userId: undefined, errorMessage: e.message }
        } else {
          return { userId: undefined, errorMessage: "An unknown error ocurred" }
        }
      }
    },
    { key: () => params.token },
  )

const Page: Component = () => {
  const data = useRouteData<typeof routeData>()
  const token = useParams<{ token: string }>().token

  const [enrolling, { Form }] = createServerAction$(async (form: FormData) => {
    const password = form.get("password")
    const confirmPassword = form.get("confirmPassword")
    const token = form.get("token")
    console.log(token)
    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      throw new ServerError("Invalid password")
    }
    if (password != confirmPassword) {
      throw new ServerError("Passwords do not match")
    }
    try {
      const userId = await validatePasswordResetToken(token)
      let user = await auth.getUser(userId)
      await auth.invalidateAllUserSessions(userId)
      await auth.updateKeyPassword("email", user.email, password)

      if (!user.emailVerified) {
        user = await auth.updateUserAttributes(user.userId, {
          emailVerified: true,
        })
      }

      const session = await auth.createSession({
        userId: user.userId,
        attributes: {},
      })
      const sessionCookie = auth.createSessionCookie(session)
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/app/budget",
          "Set-Cookie": sessionCookie.serialize(),
        },
      })
    } catch (e) {
      if (e instanceof Error) {
        throw e
      }
      throw new ServerError("Invalid or expired password reset link")
    }
  })

  return (
    <div class="bg-gray-100 min-h-screen flex flex-col items-center">
      <div class="mx-4 w-11/12 mt-12 max-w-sm bg-white p-4 rounded-lg flex flex-col items-center shadow">
        <h1 class="text-3xl mb-8 text-center">Password Reset</h1>
        <ErrorBoundary fallback={(e: Error) => <div>what</div>}>
          <Show
            when={data()?.userId}
            fallback={<div>{`${data()?.errorMessage}`}</div>}
          >
            <Form class="w-full">
              <input type="hidden" name="token" value={token} />
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
              <div class="flex flex-col">
                <label class="text-sm" for="confirmPassword">
                  Confirm Password
                </label>
                <input
                  class="border border-gray-200"
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                />
              </div>
              <br />
              <Show when={enrolling.error}>
                <div class="text-red-600">{enrolling.error.message}</div>
              </Show>
              <input
                class="w-full p-2 rounded bg-blue-500 text-white cursor-pointer"
                type="submit"
              />
            </Form>
          </Show>
        </ErrorBoundary>
      </div>
    </div>
  )
}

export default Page
