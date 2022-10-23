import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { deleteGroupById } from "~/lib/groups/deleteGroupById"
import { getGroupById } from "~/lib/groups/getGroupById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const session = await getSession({ req })
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
      return res.status(403).send("Not allowed")
    }

    const data = await deleteGroupById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
