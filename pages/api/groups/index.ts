import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { getGroups } from "~/lib/groups/getGroups"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const session = await getSession({ req })

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "GET") {
    const data = await getGroups()

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
