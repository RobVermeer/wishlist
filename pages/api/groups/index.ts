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

const publicGroupProperties = {
  id: true,
  title: true,
  createdBy: {
    select: publicUserProperties,
  },
  wishlist: {
    select: publicWishlistProperties,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method, body } = req
  const session = await getSession({ req })

  if (method === "GET") {
    const data = await prisma.group.findMany({
      orderBy: { createdAt: "desc" },
      select: publicGroupProperties,
    })

    const userData = await prisma.user.findUnique({
      select: {
        subscribed: {
          select: {
            id: true,
          },
        },
      },
      where: {
        id: session.userId as string,
      },
    })

    const d = data.map((group) => ({
      ...group,
      isSubscribed: userData.subscribed.map(({ id }) => id).includes(group.id),
    }))

    return res.status(200).json({ data: d })
  }

  if (method === "POST") {
    const { title } = JSON.parse(body)

    const data = await prisma.group.create({
      data: {
        title,
        createdAt: new Date(),
        userId: session.userId as string,
      },
    })

    return res.status(200).json({ data })
  }

  return res.status(404).send("")
}
