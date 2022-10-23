import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import { createWishlistForUser } from "~/lib/wishlists/createWishlistForUser"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const session = await getSession({ req })

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  const { userId } = session

  if (method === "POST") {
    const { title, groups } = JSON.parse(body)

    const data = await createWishlistForUser(userId, {
      title,
      groups: { connect: groups.map((id) => ({ id })) },
    })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
