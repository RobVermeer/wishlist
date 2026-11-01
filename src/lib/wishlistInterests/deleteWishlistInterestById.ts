"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { managedByUser } from "@/lib/wishlists/visibility"

export const deleteWishlistInterestById = async (id: string) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const { count } = await prisma.wishlistInterest.deleteMany({
      where: {
        id,
        wishlist: { removed: false, ...managedByUser(session.user.id) },
      },
    })

    if (count === 0) {
      throw new Error(t("interest.notFound"))
    }

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
