import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getGroupById } from "~/lib/groups/getGroupById"
import { updateGroupById } from "~/lib/groups/updateGroupById"

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

  const { userId } = session as unknown as { userId: string }

  if (method === "PUT") {
    const group = await getGroupById(id)

    const newList = new Set([...group.members.map(({ id }) => id)])

    if (newList.has(userId)) {
      newList.delete(userId)
    } else {
      newList.add(userId)
    }

    const members = {
      set: [...newList].map((id) => ({ id })),
    }

    const data = updateGroupById(id, { members })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
