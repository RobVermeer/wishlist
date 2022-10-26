import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { deleteWishlistItemById } from "~/lib/wishlistItems/deleteWishlistItemById"
import { getWishlistItemById } from "~/lib/wishlistItems/getWishlistItemById"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const session = await getSession({ req })
  const { id, itemId } = query

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "DELETE") {
    const wishlist = await getWishlistById(id)
    const wishlistItem = await getWishlistItemById(itemId)

    if (wishlistItem.wishlist.id !== wishlist.id) {
      return res.status(403).json({ error: "Not allowed" })
    }

    if (wishlistItem.wishlist.user.id !== session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const data = deleteWishlistItemById(itemId)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
