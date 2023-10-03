import { redirect, type APIEvent, serializeCookie } from "solid-start"
import { auth, googleAuth } from "~/auth/lucia.js"

export const GET = async (event: APIEvent) => {
  const authRequest = auth.handleRequest(event.request)
  const session = await authRequest.validate()
  if (session) {
    return redirect("/app/budget", 302)
  }
  const [url, state] = await googleAuth.getAuthorizationUrl()
  const stateCookie = serializeCookie("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  })
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": stateCookie,
    },
  })
}
