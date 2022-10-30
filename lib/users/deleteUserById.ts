import prisma from "~/lib/prisma"

export const deleteUserById = async (id: string) => {
  const data = await prisma.user.delete({
    where: { id },
  })

  return data
}
