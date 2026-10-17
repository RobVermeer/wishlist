"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { revalidatePath } from "next/cache"
import { wishlistSchema } from "@/lib/schema"
import * as z from "zod"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { trackIssue } from "@/lib/trackIssue"
import { assertGroupsOfUser } from "./assertGroupsOfUser"
import { keepOneOwnWishlistPerGroup } from "./keepOneOwnWishlistPerGroup"

export const createWishlistForUser = async (formData: FormData) => {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const data = wishlistSchema.parse({
      name: formData.get("name")?.toString() || undefined,
      description: formData.get("description")?.toString() || undefined,
      theme: formData.get("theme")?.toString() || undefined,
      groups: formData.getAll("groups").map(group => group.toString()),
    })

    await assertGroupsOfUser(userId, data.groups, t("group.notFound"))

    await prisma.$transaction(async tx => {
      const wishlist = await tx.wishlist.create({
        select: wishlistProperties,
        data: {
          title: data.name || null,
          description: data.description || null,
          theme: data.theme || null,
          groups: { connect: data.groups?.map(id => ({ id })) },
          createdAt: new Date(),
          userId,
        },
      })

      if (!data.name) {
        await keepOneOwnWishlistPerGroup(tx, userId, wishlist.id, data.groups)
      }
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

    trackIssue("Create wishlist for user", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
