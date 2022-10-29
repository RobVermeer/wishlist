import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { deleteGroupById } from "~/lib/groups/deleteGroupById"
import { getGroupById } from "~/lib/groups/getGroupById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const session = await getSession(req, res, authOptions)
  const { id } = query

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "DELETE") {
    const group = await getGroupById(id)

    if (group.createdBy.id !== session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const data = await deleteGroupById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
