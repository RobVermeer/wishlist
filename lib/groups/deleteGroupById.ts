import prisma from "~/lib/prisma"

export const deleteGroupById = async (id) => {
  const data = await prisma.group.delete({
    where: { id },
  })

  return data
}
