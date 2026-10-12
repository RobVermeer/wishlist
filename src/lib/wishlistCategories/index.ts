import { Prisma } from "@/generated/prisma/client"

export const categoryProperties = {
  id: true,
  title: true,
  position: true,
}

export async function findOrCreateCategory(
  tx: Prisma.TransactionClient,
  wishlistId: string,
  title?: string
) {
  if (!title) return null

  const categories = await tx.wishlistCategory.findMany({
    where: { wishlistId },
    orderBy: { position: "asc" },
  })
  const existing = categories.find(
    category => category.title.toLowerCase() === title.toLowerCase()
  )

  if (existing) return existing.id

  const created = await tx.wishlistCategory.create({
    data: {
      wishlistId,
      title,
      position: (categories.at(-1)?.position ?? -1) + 1,
    },
  })

  return created.id
}

export async function removeEmptyCategories(
  tx: Prisma.TransactionClient,
  wishlistId: string
) {
  await tx.wishlistCategory.deleteMany({
    where: { wishlistId, wishlistItem: { none: { removed: false } } },
  })
}
