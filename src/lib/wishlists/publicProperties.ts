import { userProperties } from "@/lib/users/publicProperties"
import { wishlistItemProperties } from "@/lib/wishlistItems/publicProperties"
import { categoryProperties } from "@/lib/wishlistCategories"

export const wishlistProperties = {
  id: true,
  title: true,
  theme: true,
  user: {
    select: userProperties,
  },
  managers: {
    select: { id: true },
  },
  groups: {
    select: { id: true, title: true },
    where: { removed: false },
  },
  wishlistItem: {
    select: wishlistItemProperties,
    where: { removed: false },
    orderBy: [{ position: "asc" as const }, { createdAt: "asc" as const }],
  },
  categories: {
    select: categoryProperties,
    orderBy: { position: "asc" as const },
  },
}
