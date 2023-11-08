import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "pages_old/api/auth/[...nextauth]"
import { getGroups } from "~/lib/groups/getGroups"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const session = await getSession(req, res, authOptions)

  if (!session || !session.user.id) {
    return res.status(404).send("")
  }

  if (method === "GET") {
    const data = await getGroups()

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
