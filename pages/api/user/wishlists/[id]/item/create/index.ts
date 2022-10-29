import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { createWishlistItemForUser } from "~/lib/wishlistItems/createWishlistItemForUser"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const session = await getSession(req, res, authOptions)
  const { id } = query

  if (!id || Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "POST") {
    const wishlist = await getWishlistById(id)

    if (!wishlist) {
      return res.status(404).send("")
    }

    if (wishlist.user.id !== session.userId) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const { title, url } = JSON.parse(body)

    const data = createWishlistItemForUser(id, { title, url })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
