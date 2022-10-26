import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { deleteWishlistById } from "~/lib/wishlists/deleteWishlistById"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"

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
    const wishlist = await getWishlistById(id)

    if (wishlist.user.id !== session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const data = await deleteWishlistById(id)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
