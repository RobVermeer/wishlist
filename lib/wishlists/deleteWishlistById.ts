import prisma from "~/lib/prisma"

export const deleteWishlistById = async (id: string) => {
  const data = await prisma.wishlist.delete({
    where: { id },
  })

  return data
}
