import prisma from "~/lib/prisma"

export const getUsers = async () => {
  const data = await prisma.user.findMany({
    orderBy: { name: "asc" },
  })

  return data
}
