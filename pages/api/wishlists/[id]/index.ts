import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, query, body } = req
  const { id } = query
  const session = await getSession({ req })

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "GET") {
    const data = await getWishlistById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}