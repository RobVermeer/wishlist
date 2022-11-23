import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { deleteUserById } from "~/lib/users/deleteUserById"
import { getUserById } from "~/lib/users/getUserById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const session = await getSession(req, res, authOptions)
  const { id } = query

  if (!id || Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId || !session.isAdmin) {
    return res.status(404).send("")
  }

  if (method === "DELETE") {
    const user = await getUserById(id)

    if (!user) {
      return res.status(404).send("")
    }

    if (user.id === session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const data = await deleteUserById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
