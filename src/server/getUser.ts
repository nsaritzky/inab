import { getSession } from "@solid-auth/base"
import { redirect } from "solid-start"
import { getUserByEmail } from "~/db"
import { authOpts } from "~/routes/api/auth/[...solidauth]"

export const getUser = async (request: Request) => {
  const session = await getSession(request, authOpts)
  const user = session?.user
  if (!session || !user) {
    throw redirect("/")
  }
  return await getUserByEmail(user?.email!)
}
