import type { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession as getSession } from "next-auth/next"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { createWishlistForUser } from "~/lib/wishlists/createWishlistForUser"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const session = await getSession(req, res, authOptions)

  if (!session || !session.userId) {
    return res.status(404).send("")
  }

  const { userId } = session

  if (method === "POST") {
    const { title, groups } = JSON.parse(body)

    const data = await createWishlistForUser(userId as string, {
      title,
      groups: { connect: groups.map((id: string) => ({ id })) },
    })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
