import prisma from "~/lib/prisma"

export const deleteWishlistById = async (id) => {
  const data = await prisma.wishlist.delete({
    where: { id },
  })

  return data
}
