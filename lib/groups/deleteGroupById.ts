import prisma from "~/lib/prisma"

export const deleteGroupById = async (id: string) => {
  const data = await prisma.group.delete({
    where: { id },
  })

  return data
}
