"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { getErrorMessage } from "@/lib/utils"
import { wishlistItemSchema } from "@/lib/schema"
import { getTranslations } from "next-intl/server"
import { nextWishlistItemPosition } from "./nextWishlistItemPosition"
import { findOrCreateCategory } from "@/lib/wishlistCategories"
import { managedByUser } from "@/lib/wishlists/visibility"

export const createWishlistItemForUser = async (
  wishlistId: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
        ...managedByUser(userId),
      },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const data = wishlistItemSchema.parse({
      title: formData.get("title")?.toString(),
      unlimited: formData.get("unlimited")?.toString() === "on",
      url: formData.get("url")?.toString() || undefined,
      category: formData.get("category")?.toString() || undefined,
    })

    await prisma.$transaction(async tx => {
      const categoryId = await findOrCreateCategory(
        tx,
        wishlistId,
        data.category
      )

      await tx.wishlistItem.create({
        select: wishlistItemProperties,
        data: {
          title: data.title,
          unlimited: data.unlimited,
          url: data.url || null,
          createdAt: new Date(),
          wishlistId,
          categoryId,
          position: await nextWishlistItemPosition(tx, wishlistId),
        },
      })
    })

    revalidatePath("/")

    return {
      type: "success" as const,
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
