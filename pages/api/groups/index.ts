import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prisma"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const data = await prisma.group.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: true, createdBy: true, wishlist: true },
    })
    return res.status(200).json(data)
  }
  return res.status(404).send("")
}
