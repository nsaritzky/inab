import { ErrorBoundary, Show, type Component } from "solid-js"
import { generatePasswordResetToken } from "~/token"
import { createServerAction$, ServerError } from "solid-start/server"
import { getUserByEmail } from "~/db"
import { sendPasswordResetEmail, validateEmail } from "~/email"

const Page: Component = () => {
  const [enrolling, { Form }] = createServerAction$(
    async (form: FormData, { request }) => {
      const email = form.get("email")
      if (!validateEmail(email)) {
        throw new ServerError("Invalid email")
      }
      try {
        const storedUser = await getUserByEmail(email as string)
        if (!storedUser) {
          throw new ServerError("User does not exist")
        }
        const token = await generatePasswordResetToken(storedUser.id)
        await sendPasswordResetEmail(storedUser.email, token)
        return new Response()
      } catch (e) {
        if (e instanceof Error) {
          throw e
        }
        throw new ServerError("An unknown error ocurred")
      }
    },
  )

  return (
    <div class="bg-gray-100 min-h-screen flex flex-col items-center">
      <div class="mx-4 w-11/12 mt-12 max-w-sm bg-white p-4 rounded-lg flex flex-col items-center shadow">
        <h1 class="text-3xl mb-8 text-center">Password Reset</h1>
        <ErrorBoundary fallback={(e: Error) => <div>what</div>}>
          <Form class="w-full">
            <div class="flex flex-col">
              <label class="text-sm" for="email">
                Email Address
              </label>
              <input class="border border-gray-200" type="email" name="email" />
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
      </div>
    </div>
  )
}

export default Page
