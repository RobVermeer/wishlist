"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getErrorMessage } from "@/lib/utils"
import { wishlistItemSchema } from "@/lib/schema"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"

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
        userId,
      },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const data = wishlistItemSchema.parse({
      title: formData.get("title")?.toString(),
      url: formData.get("url")?.toString() || undefined,
    })

    await prisma.wishlistItem.create({
      select: wishlistItemProperties,
      data: {
        title: data.title,
        url: data.url || null,
        createdAt: new Date(),
        wishlistId,
      },
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

    trackIssue("Create wishlist item for user", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
