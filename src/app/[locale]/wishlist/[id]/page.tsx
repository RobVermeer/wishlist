import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Wishlist } from "@/components/Wishlist"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const t = await getTranslations({ locale, namespace: "Common" })
  const wishlist = await getWishlistById(id)

  if (!wishlist) return {}

  const title =
    wishlist.title ||
    (wishlist.isOwnList
      ? t("myList")
      : wishlist.user.firstName || wishlist.user.name?.split(" ")[0])

  return {
    title: `${title} - Niet Weer Sokken`,
  }
}

export default async function WishlistPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/wishlist/${id}`)}`)
  }

  return <Wishlist id={id} />
}
