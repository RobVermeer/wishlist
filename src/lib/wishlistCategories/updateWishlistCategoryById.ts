"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { wishlistCategorySchema } from "@/lib/schema"
import { managedByUser } from "@/lib/wishlists/visibility"

export const updateWishlistCategoryById = async (
  id: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const category = await prisma.wishlistCategory.findUnique({
      where: {
        id,
        wishlist: { removed: false, ...managedByUser(session.user.id) },
      },
      include: { wishlist: { select: { categories: true } } },
    })

    if (!category) {
      throw new Error(t("category.notFound"))
    }

    const data = wishlistCategorySchema.parse({
      title: formData.get("title")?.toString(),
    })

    // Wishes find their category by name, so two can't share one.
    const taken = category.wishlist.categories.some(
      other =>
        other.id !== id &&
        other.title.toLowerCase() === data.title.toLowerCase()
    )

    if (taken) {
      throw new Error(t("category.exists"))
    }

    await prisma.wishlistCategory.update({
      where: { id },
      data: { title: data.title },
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
