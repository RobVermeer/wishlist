"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { revalidatePath } from "next/cache"
import { wishlistItemSchema } from "@/lib/schema"
import { getErrorMessage } from "@/lib/utils"
import * as z from "zod"
import { getTranslations } from "next-intl/server"
import { nextWishlistItemPosition } from "./nextWishlistItemPosition"
import {
  findOrCreateCategory,
  removeEmptyCategories,
} from "@/lib/wishlistCategories"
import { managedByUser } from "@/lib/wishlists/visibility"

export const updateWishlistItemById = async (
  id: string,
  formData: FormData
) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: managedByUser(userId),
        removed: false,
      },
    })

    if (!wishlistItem) {
      throw new Error(t("item.notFound"))
    }

    const data = wishlistItemSchema.parse({
      title: formData.get("title")?.toString(),
      unlimited: formData.get("unlimited")?.toString() === "on",
      links: formData
        .getAll("url")
        .map(url => url.toString().trim())
        .filter(Boolean),
      category: formData.get("category")?.toString() || undefined,
    })

    const categoryId = await prisma.$transaction(async tx => {
      const categoryId = await findOrCreateCategory(
        tx,
        wishlistItem.wishlistId,
        data.category
      )

      await tx.wishlistItem.update({
        where: { id },
        data: {
          title: data.title,
          unlimited: data.unlimited,
          links: {
            deleteMany: {},
            create: data.links.map((url, position) => ({ url, position })),
          },
          categoryId,
          ...(categoryId !== wishlistItem.categoryId && {
            position: await nextWishlistItemPosition(
              tx,
              wishlistItem.wishlistId
            ),
          }),
        },
        select: wishlistItemProperties,
      })

      await removeEmptyCategories(tx, wishlistItem.wishlistId)

      return categoryId
    })

    revalidatePath("/")

    return {
      type: "success" as const,
      categoryId,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: "error" as const,
        errors: error.issues.map(issue => issue.message),
      }
    }

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
