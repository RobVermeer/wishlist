import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "next-auth/react"
import prisma from "~/lib/prisma"

const publicUserProperties = {
  id: true,
  name: true,
  image: true,
}

const publicWishlistProperties = {
  id: true,
  title: true,
  user: {
    select: publicUserProperties,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const session = await getSession({ req })

  if (method === "GET") {
    const data = await prisma.wishlist.findMany({
      orderBy: { createdAt: "desc" },
      select: publicWishlistProperties,
      where: {
        userId: session.userId as string,
      },
    })

    return res.status(200).json({ data })
  }

  if (method === "POST") {
    const { title, groups = [] } = JSON.parse(body)

    const data = await prisma.wishlist.create({
      data: {
        title,
        createdAt: new Date(),
        userId: session.userId as string,
        groups: {
          connect: groups.map((id) => ({ id })),
        },
      },
    })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
