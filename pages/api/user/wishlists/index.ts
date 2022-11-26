import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req
  const session = await getSession(req, res, authOptions)

  if (!session || !session.user.id) {
    return res.status(404).send("")
  }

  const { user } = session
  const { id: userId } = user

  if (method === "GET") {
    const data = await getWishlistsForUser(userId)

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
