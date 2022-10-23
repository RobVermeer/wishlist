import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import { updateWishlistById } from "~/lib/wishlists/updateWishlistById"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body, query } = req
  const session = await getSession({ req })
  const { id } = query

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  if (method === "POST") {
    const wishlist = await getWishlistById(id)

    if (wishlist.user.id !== session.userId) {
      return res.status(403).send("Not allowed")
    }

    const { groupId } = JSON.parse(body)

    const newList = new Set([...wishlist.groups.map(({ id }) => id)])

    if (newList.has(groupId)) {
      newList.delete(groupId)
    } else {
      newList.add(groupId)
    }

    const groups = {
      set: [...newList].map((id) => ({ id })),
    }

    const data = updateWishlistById(id, { groups })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
