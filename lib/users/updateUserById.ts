import prisma from "~/lib/prisma"
import { userProperties } from "./publicProperties"

export const updateUserById = async (id: string, userData: any) => {
  const data = await prisma.user.update({
    where: { id },
    data: userData,
    select: userProperties,
  })

  return data
}
