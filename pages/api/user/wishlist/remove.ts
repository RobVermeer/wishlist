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
  const session = await getSession({ req })
  const { method, body } = req

  if (method === "DELETE") {
    const { wishlistId } = JSON.parse(body)
    try {
      const wishlist = await prisma.wishlist.delete({
        where: {
          id: wishlistId,
        },
      })

      return res.status(200).json({ data: wishlist })
    } catch (error) {
      console.log(error)
    }
  }

  return res.status(404).send("")
}
