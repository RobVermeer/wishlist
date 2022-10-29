import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { createGroupForUser } from "~/lib/groups/createGroupForUser"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const session = await getSession(req, res, authOptions)

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  const { userId } = session

  if (method === "POST") {
    const { title } = JSON.parse(body)

    const data = await createGroupForUser(userId, {
      title,
      members: { connect: [{ id: userId }] },
    })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
