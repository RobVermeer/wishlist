"use server"

// import { mkdir, writeFile } from "fs/promises"
// import { join } from "path"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { getServerSession } from "next-auth"
// import sharp from "sharp"

export async function updateProfile(data: FormData) {
  try {
    const session = await getServerSession(authOptions)
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const firstName = data.get("firstName")?.toString()
    const avatar = data.get("avatar") as File | null

    if (!firstName && !avatar?.size) {
      throw new Error(t("nothingChanged"))
    }

    let uploadedImage

    // if (avatar?.size) {
    //   const bytes = await avatar.arrayBuffer()
    //   const buffer = Buffer.from(bytes)

    //   await mkdir(join("./public/avatars", session.user.id), {
    //     recursive: true,
    //   })
    //   const imagePath = join(
    //     "./public/avatars",
    //     session.user.id,
    //     `${performance.now()}-${avatar.name}`
    //   )

    //   const resizedBuffer = await sharp(buffer)
    //     .resize({ fit: "cover", height: 96, width: 96 })
    //     .toBuffer()

    //   await writeFile(imagePath, resizedBuffer)

    //   uploadedImage = `${process.env.BASE_URL}/${imagePath.replace(
    //     "public/",
    //     ""
    //   )}`
    // }

    await prisma.user.update({
      data: {
        firstName: firstName || undefined,
        image: uploadedImage,
      },
      where: {
        id: session.user.id,
      },
    })

    revalidatePath("/")
    return {
      type: "success" as const,
    }
  } catch (error) {
    console.error("Update first name by ID", error)

    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
