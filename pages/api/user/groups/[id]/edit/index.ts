import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getGroupById } from "~/lib/groups/getGroupById"
import { updateGroupById } from "~/lib/groups/updateGroupById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const session = await getSession(req, res, authOptions)
  const { id } = query

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "PUT") {
    const group = await getGroupById(id)

    if (group.createdBy.id !== session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const { title } = JSON.parse(body)

    const data = updateGroupById(id, { title })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
