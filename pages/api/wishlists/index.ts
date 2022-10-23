import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { getWishlists } from "~/lib/wishlists/getWishlists"

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
    const data = await getWishlists()

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
