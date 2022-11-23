import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getGroupById } from "~/lib/groups/getGroupById"
import { deleteGroupById } from "~/lib/groups/deleteGroupById"

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

  if (!session || !session.user.id || !session.user.isAdmin) {
    return res.status(404).send("")
  }

  if (method === "DELETE") {
    const group = await getGroupById(id)

    if (!group) {
      return res.status(404).send("")
    }

    const data = await deleteGroupById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
