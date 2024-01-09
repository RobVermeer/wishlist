"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { wishlistItemSchema } from "@/lib/schema"
import { getErrorMessage } from "@/lib/utils"
import { z } from "zod"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

export const updateWishlistItemById = async (
  id: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: {
          userId,
        },
        removed: false,
      },
    })

    if (!wishlistItem) {
      throw new Error(t("item.notFound"))
    }

    const data = wishlistItemSchema.parse({
      title: formData.get("title")?.toString(),
      url: formData.get("url")?.toString() || undefined,
    })

    await prisma.wishlistItem.update({
      where: { id },
      data: {
        title: data.title,
        url: data.url || null,
      },
      select: wishlistItemProperties,
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        type: "error" as const,
        errors: error.issues.map((issue) => issue.message),
      }
    }

    trackIssue("Update wishlist item by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
