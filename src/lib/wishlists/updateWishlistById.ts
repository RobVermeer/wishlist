"use server"

import { prisma } from "@/lib/prisma"
import { wishlistProperties } from "./publicProperties"
import { getSession } from "@/lib/getSession"
import { revalidatePath } from "next/cache"
import { maxInterests, wishlistSchema } from "@/lib/schema"
import * as z from "zod"
import { translateIssues } from "@/lib/translateIssues"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { assertGroupsOfUser } from "./assertGroupsOfUser"
import { assertManagersOfUser } from "./assertManagersOfUser"
import { keepOneOwnWishlistPerGroup } from "./keepOneOwnWishlistPerGroup"
import { managedByUser } from "./visibility"

export const updateWishlistById = async (id: string, formData: FormData) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const userId = session.user.id
    const managesThisWishlist = {
      OR: [{ wishlists: { some: { id } } }, { managing: { some: { id } } }],
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: {
        id,
        removed: false,
        ...managedByUser(userId),
      },
      select: {
        userId: true,
        managers: { select: { id: true } },
        interests: { select: { id: true, title: true } },
        groups: {
          select: { id: true },
          where: {
            members: { none: { id: userId }, some: managesThisWishlist },
          },
        },
      },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const data = wishlistSchema.parse({
      name: formData.get("name")?.toString() || undefined,
      theme: formData.get("theme")?.toString() || undefined,
      groups: formData.getAll("groups").map(group => group.toString()),
      managers: formData.getAll("managers").map(manager => manager.toString()),
      interests: formData
        .getAll("interests")
        .map(interest => interest.toString()),
    })
    const interests = data.interests ?? []
    const isOwner = wishlist.userId === userId
    const currentManagerIds = wishlist.managers.map(({ id }) => id)
    const managerIds = data.name ? (data.managers ?? []) : []

    if (!isOwner && !data.name) {
      throw new Error(t("noAccess"))
    }

    const duplicate = interests.find((title, index) =>
      interests
        .slice(0, index)
        .some(other => other.toLowerCase() === title.toLowerCase())
    )

    if (duplicate) {
      throw new Error(t("interest.duplicate", { title: duplicate }))
    }

    if (interests.length > maxInterests) {
      throw new Error(t("interest.tooMany", { max: maxInterests }))
    }

    await assertGroupsOfUser(userId, data.groups, t("group.notFound"))

    if (isOwner) {
      await assertManagersOfUser(
        userId,
        managerIds.filter(managerId => !currentManagerIds.includes(managerId)),
        t("user.notFound")
      )
    }

    await prisma.$transaction(async tx => {
      await tx.wishlist.update({
        where: { id },
        data: {
          title: data.name || null,
          theme: data.theme || null,
          groups: {
            set: [
              ...wishlist.groups,
              ...(data.groups ?? []).map(id => ({ id })),
            ],
          },
          ...(isOwner && {
            managers: { set: managerIds.map(id => ({ id })) },
          }),
        },
        select: wishlistProperties,
      })

      // Interests that stay keep their place, new ones go at the end.
      await tx.wishlistInterest.deleteMany({
        where: {
          wishlistId: id,
          id: {
            in: wishlist.interests
              .filter(({ title }) => !interests.includes(title))
              .map(({ id }) => id),
          },
        },
      })
      const added = interests.filter(
        title => !wishlist.interests.some(interest => interest.title === title)
      )
      const now = Date.now()
      await tx.wishlistInterest.createMany({
        data: added.map((title, index) => ({
          title,
          wishlistId: id,
          createdAt: new Date(now + index),
        })),
      })

      if (!data.name) {
        await keepOneOwnWishlistPerGroup(tx, userId, id, data.groups)
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
        errors: translateIssues(error, await getTranslations("Validation")),
      }
    }

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
