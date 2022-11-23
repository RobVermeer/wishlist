import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getWishlistItemById } from "~/lib/wishlistItems/getWishlistItemById"
import { updateWishlistItemById } from "~/lib/wishlistItems/updateWishlistItemById"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const session = await getSession(req, res, authOptions)
  const { id, itemId } = query

  if (!id || Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!itemId || Array.isArray(itemId)) {
    return res.status(404).send("")
  }

  if (!session || !session.user.id) {
    return res.status(404).send("")
  }

  if (method === "PUT") {
    const wishlist = await getWishlistById(id)
    const wishlistItem = await getWishlistItemById(itemId)

    if (!wishlistItem || !wishlist) {
      return res.status(404).send("")
    }

    if (wishlistItem.wishlist.id !== wishlist.id) {
      return res.status(403).json({ error: "Not allowed" })
    }

    if (wishlistItem.wishlist.user.id !== session.user.id) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const { title, url } = JSON.parse(body)

    const data = updateWishlistItemById(itemId, { title, url })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
