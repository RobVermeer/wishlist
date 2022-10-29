import prisma from "~/lib/prisma"

export const deleteWishlistItemById = async (id: string) => {
  const data = await prisma.wishlistItem.delete({
    where: { id },
  })

  return data
}
