import { auth } from "~/auth/lucia"
import { validateEmailVerificationToken } from "~/token"
import { APIEvent, useLocation, useParams } from "solid-start"

export const GET = async ({ params }: APIEvent) => {
  const token = params.token
  try {
    const userId = await validateEmailVerificationToken(token)
    const user = await auth.getUser(userId)
    await auth.invalidateAllUserSessions(user.userId)
    await auth.updateUserAttributes(user.userId, {
      emailVerified: true,
    })
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
  } catch {
    return new Response("invalid email verification link", {
      status: 400,
    })
  }
}
