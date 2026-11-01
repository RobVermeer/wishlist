"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import * as z from "zod"
import { getErrorMessage } from "@/lib/utils"
import { maxInterests, wishlistInterestSchema } from "@/lib/schema"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "@/lib/wishlists/visibility"

export const createWishlistInterest = async (
  wishlistId: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
        removed: false,
        ...managedByUser(session.user.id),
      },
      include: { interests: { select: { title: true } } },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const { title } = wishlistInterestSchema.parse({
      title: formData.get("title")?.toString() ?? "",
    })

    if (
      wishlist.interests.some(
        interest => interest.title.toLowerCase() === title.toLowerCase()
      )
    ) {
      throw new Error(t("interest.duplicate", { title }))
    }

    if (wishlist.interests.length >= maxInterests) {
      throw new Error(t("interest.tooMany", { max: maxInterests }))
    }

    await prisma.wishlistInterest.create({
      data: { title, createdAt: new Date(), wishlistId },
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
