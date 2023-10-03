import { auth } from "~/auth/lucia"
import { generateEmailVerificationToken } from "~/token.js"
import { sendValidationEmail } from "~/email.js"
import { APIEvent } from "solid-start"

export const POST = async (event: APIEvent) => {
  const authRequest = auth.handleRequest(event.request)
  const session = await authRequest.validate()
  if (!session) {
    return new Response(null, {
      status: 401,
    })
  }
  if (session.user.emailVerified) {
    // email already verified
    return new Response(null, {
      status: 422,
    })
  }
  try {
    const token = await generateEmailVerificationToken(session.user.userId)
    await sendValidationEmail(session.user.email, token)
    return new Response()
  } catch {
    return new Response("An unknown error occurred", {
      status: 500,
    })
  }
}
