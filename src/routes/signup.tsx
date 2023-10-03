import ErrorBoundary, { A } from "solid-start"
import {
  ServerError,
  createServerAction$,
  createServerData$,
  redirect,
} from "solid-start/server"
import { Prisma } from "@prisma/client"
import { auth } from "~/auth/lucia"
import { Show } from "solid-js"
import { generateEmailVerificationToken } from "~/token"
import { sendValidationEmail } from "~/email"

export const routeData = () =>
  createServerData$(async (_, event) => {
    const authRequest = auth.handleRequest(event.request)
    const session = await authRequest.validate()
    if (session) {
      return redirect("/")
    }
  })

const Page = () => {
  const [enrolling, { Form }] = createServerAction$(
    async (formData: FormData) => {
      const email = formData.get("email")
      const password = formData.get("password")
      const confirmPassword = formData.get("confirmPassword")

      if (typeof email !== "string" || email.length <= 4 || email.length > 31) {
        throw new ServerError("Invalid Username")
      }

      if (
        typeof password !== "string" ||
        password.length <= 4 ||
        password.length > 255
      ) {
        throw new ServerError("Invalid Password")
      }

      if (password != confirmPassword) {
        throw new ServerError("Passwords do not match")
      }
      try {
        const user = await auth.createUser({
          key: {
            providerId: "email",
            providerUserId: email.toLowerCase(),
            password,
          },
          attributes: {
            email,
            emailVerified: false,
          },
        })
        const token = await generateEmailVerificationToken(user.userId)
        await sendValidationEmail(user.email, token)

        const session = await auth.createSession({
          userId: user.userId,
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
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          switch (e.code) {
            case "P2002":
              throw new ServerError(
                "There is already an account with this email address",
              )
          }
        }
        console.log(e)
        throw new ServerError("An unknown error ocurred", {
          status: 500,
        })
      }
    },
  )
  return (
    <div class="bg-gray-100 min-h-screen flex flex-col items-center">
      <div class="mx-4 w-11/12 mt-12 max-w-sm bg-white p-4 rounded-lg flex flex-col items-center shadow">
        <h1 class="text-3xl mb-8 text-center">Sign up</h1>
        <ErrorBoundary fallback={(e: Error) => <div>what</div>}>
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
        </ErrorBoundary>
        <a
          href="/auth/google"
          class="px-2 py-1 bg-slate-50 flex rounded mt-4 outline outline-slate-300"
        >
          <img
            class="mr-2"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          />
          Sign up with Google
        </a>
        <div class="mt-4 text-sm text-gray-500">Already have an account?</div>
        <A href="/login">Sign in</A>
      </div>
    </div>
  )
}

export default Page
