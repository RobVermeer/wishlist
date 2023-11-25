"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getErrorMessage } from "@/lib/utils"
import { wishlistItemSchema } from "@/lib/schema"

export const createWishlistItemForUser = async (
  wishlistId: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id: wishlistId,
        userId,
      },
    })

    if (!wishlist) {
      throw new Error("Verlanglijst is niet gevonden")
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

    console.error("Create wishlist item for user", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
