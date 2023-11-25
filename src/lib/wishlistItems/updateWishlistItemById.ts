"use server"

import { prisma } from "@/lib/prisma"
import { wishlistItemProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"
import { wishlistItemSchema } from "@/lib/schema"
import { getErrorMessage } from "@/lib/utils"
import { z } from "zod"

export const updateWishlistItemById = async (
  id: string,
  formData: FormData
) => {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new Error("Je bent niet ingelogd")
    }

    const userId = session.user.id

    const wishlistItem = await prisma.wishlistItem.findUnique({
      where: {
        id,
        wishlist: {
          userId,
        },
      },
    })

    if (!wishlistItem) {
      throw new Error("Wens is niet gevonden")
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

    console.error("Update wishlist item by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
