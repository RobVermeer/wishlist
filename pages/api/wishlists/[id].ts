import type { NextApiRequest, NextApiResponse } from "next"
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
  const { method, query, body } = req
  const { id } = query

  if (Array.isArray(id)) {
    return res.status(404).send("")
  }

  if (method === "GET") {
    const data = await prisma.wishlist.findFirst({
      where: { id },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        user: {
          select: publicUserProperties,
        },
        id: true,
        wishlistItem: true,
      },
    })

    return res.status(200).json({ data })
  }

  if (method === "DELETE") {
    try {
      const data = await prisma.group.delete({
        where: { id },
      })

      return res.status(200).json({ data })
    } catch (error) {
      console.log(error)
    }
  }

  if (method === "PUT") {
    const { title } = JSON.parse(body)
    try {
      const data = await prisma.group.update({
        where: { id },
        data: { title },
      })

      return res.status(200).json({ data })
    } catch (error) {
      console.log(error)
    }
  }

  return res.status(404).send("")
}
