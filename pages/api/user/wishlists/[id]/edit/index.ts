import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import { updateWishlistById } from "~/lib/wishlists/updateWishlistById"

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

  if (!session || !session.user.id) {
    return res.status(404).send("")
  }

  if (method === "PUT") {
    const wishlist = await getWishlistById(id)

    if (!wishlist) {
      return res.status(404).send("")
    }

    if (wishlist.user.id !== session.user.id) {
      return res.status(403).json({ error: "Not allowed" })
    }

    const { title, groups } = JSON.parse(body)

    const update: any = { title }

    if (groups) {
      update["groups"] = {
        set: [...groups].map((id) => ({ id })),
      }
    }

    const data = updateWishlistById(id, update)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
