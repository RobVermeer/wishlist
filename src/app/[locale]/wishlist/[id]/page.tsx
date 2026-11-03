import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Wishlist } from "@/components/Wishlist"
import { getSession } from "@/lib/getSession"
import { redirect } from "next/navigation"
import { BackLink } from "@/components/BackLink"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"

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
    (wishlist.isOwnList ? t("myList") : getWishlistName(wishlist))

  return {
    title: `${title} - Niet Weer Sokken`,
  }
}

export default async function WishlistPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/wishlist/${id}`)}`)
  }

  const t = await getTranslations("BackLink")

  return (
    <Wishlist id={id} backLink={<BackLink href="/" label={t("overview")} />} />
  )
}
