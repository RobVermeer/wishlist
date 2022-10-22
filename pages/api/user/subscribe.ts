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

  console.log("hello")

  if (method === "PUT") {
    const { groupId } = JSON.parse(body)
    try {
      const group = await prisma.group.findUnique({
        where: {
          id: groupId,
        },
        include: {
          members: true,
        },
      })

      const newList = new Set([...group.members.map(({ id }) => id)])

      if (newList.has(session.userId)) {
        newList.delete(session.userId)
      } else {
        newList.add(session.userId)
      }

      console.log(newList)

      const data = await prisma.group.update({
        where: {
          id: groupId,
        },
        data: {
          members: {
            set: [...newList].map((id) => ({ id })),
          },
        },
      })

      return res.status(200).json({ data })
    } catch (error) {
      console.log(error)
    }
  }

  return res.status(404).send("")
}
