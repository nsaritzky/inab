import { auth, googleAuth } from "~/auth/lucia.js"
import { OAuthRequestError } from "@lucia-auth/oauth"
import { type APIEvent, parseCookie } from "solid-start"
import { getUserByEmail } from "~/db"

export const GET = async (event: APIEvent) => {
  const cookies = parseCookie(event.request.headers.get("Cookie") ?? "")
  const storedState = cookies.google_oauth_state
  const url = new URL(event.request.url)
  const state = url.searchParams.get("state")
  const code = url.searchParams.get("code")
  if (!storedState || !state || storedState !== state || !code) {
    return new Response(null, {
      status: 400,
    })
  }
  try {
    const { getExistingUser, googleUser, createUser, createKey } =
      await googleAuth.validateCallback(code)

    const getUser = async () => {
      const existingUser = await getExistingUser()
      if (existingUser) return existingUser
      console.log(googleUser)
      if (!googleUser.email_verified) {
        throw new Error("Email not verified")
      }
      const existingDatabaseUserWithEmail = await getUserByEmail(
        googleUser.email!,
      )
      if (existingDatabaseUserWithEmail) {
        const user = auth.transformDatabaseUser({
          ...existingDatabaseUserWithEmail,
          username: existingDatabaseUserWithEmail.username || undefined,
        })
        await createKey(user.userId)
        return user
      }
      return await createUser({
        attributes: {
          email: googleUser.email!,
          emailVerified: !!googleUser.email_verified,
          username: googleUser.name,
        },
      })
    }
    const user = await getUser()
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
    if (e instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      })
    }
    console.log(e)
    return new Response(null, {
      status: 500,
    })
  }
}
