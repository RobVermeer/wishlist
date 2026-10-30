"use server"

import { mkdir, readdir, rm } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/nextAuth"
import { getServerSession } from "next-auth"
import { Jimp } from "jimp"
import { trackIssue } from "@/lib/trackIssue"
import { userSchema } from "@/lib/schema"
import { avatarFolder } from "@/lib/users/avatarFolder"
import * as z from "zod"

const maxMegapixels = 25
const pngSignature = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
])

function largestPngHeader(buffer: Buffer) {
  let pixels = 0

  for (
    let offset = 8;
    offset + 16 <= buffer.length;
    offset += buffer.readUInt32BE(offset) + 12
  ) {
    if (buffer.toString("latin1", offset + 4, offset + 8) === "IHDR") {
      const size =
        buffer.readUInt32BE(offset + 8) * buffer.readUInt32BE(offset + 12)
      pixels = Math.max(pixels, size)
    }
  }

  return pixels
}

async function readAvatar(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())
  const isPng = buffer.subarray(0, 8).equals(pngSignature)
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8

  if (isPng && largestPngHeader(buffer) > maxMegapixels * 1_000_000) {
    return null
  }

  if (!isPng && !isJpeg) {
    return null
  }

  return Jimp.fromBuffer(buffer, {
    "image/jpeg": { maxResolutionInMP: maxMegapixels },
  }).catch(() => null)
}

async function removeOtherAvatars(folder: string, keep: string) {
  try {
    const files = await readdir(folder)

    await Promise.all(
      files
        .filter(file => file !== keep)
        .map(file => rm(join(folder, file), { recursive: true, force: true }))
    )
  } catch (error) {
    trackIssue("Remove previous avatars", "error", { error })
  }
}

export async function updateProfile(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const { firstName } = userSchema.partial().parse({
      firstName: data.get("firstName")?.toString() || undefined,
    })
    const avatar = data.get("avatar") as File | null

    if (!firstName && !avatar?.size) {
      throw new Error(t("nothingChanged"))
    }

    const folder = avatarFolder(session.user.id)
    let uploadedImage
    let uploadedFile

    if (avatar?.size) {
      const image = await readAvatar(avatar)

      if (!image) {
        throw new Error(t("user.avatar"))
      }

      uploadedFile = `${randomUUID()}.png`
      await mkdir(folder, { recursive: true })
      const imagePath = join(folder, uploadedFile) as `${string}.png`

      await image.cover({ w: 96, h: 96 }).write(imagePath)

      uploadedImage = `${process.env.BASE_URL}/${imagePath.replace(
        "public/",
        ""
      )}`
    }

    await prisma.user.update({
      data: {
        firstName,
        image: uploadedImage,
      },
      where: {
        id: session.user.id,
      },
    })

    if (uploadedFile) {
      await removeOtherAvatars(folder, uploadedFile)
    }

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

    trackIssue("Update first name by ID", "error", { error })

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
