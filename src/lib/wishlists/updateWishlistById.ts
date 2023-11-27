"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { wishlistSchema } from "@/lib/schema"
import { z } from "zod"
import { getErrorMessage } from "@/lib//utils"
import { getTranslations } from "next-intl/server"

export const updateWishlistById = async (id: string, formData: FormData) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id,
        userId,
      },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const data = wishlistSchema.parse({
      name: formData.get("name")?.toString() || undefined,
      groups: formData.getAll("groups").map((group) => group.toString()),
    })

    await prisma.wishlist.update({
      where: { id },
      data: {
        title: data.name || null,
        groups: { set: data.groups?.map((id) => ({ id })) },
      },
      select: wishlistProperties,
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

    console.error("Update wishlist by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
