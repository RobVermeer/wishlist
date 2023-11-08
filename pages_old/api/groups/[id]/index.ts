import type { NextApiRequest, NextApiResponse } from "next"
import { getGroupById } from "~/lib/groups/getGroupById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query } = req
  const { id } = query

  if (!id || Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (method === "GET") {
    const data = await getGroupById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
