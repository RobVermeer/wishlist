import prisma from "~/lib/prisma"

export const getUsers = async () => {
  const data = await prisma.user.findMany()

  return data
}
