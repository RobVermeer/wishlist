import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Wishlist } from "@/components/Wishlist"
import { Suspense } from "react"
import { WishlistSkeleton } from "@/components/WishlistSkeleton/index."

interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Common" })
  const wishlist = await getWishlistById(id, true)

  if (!wishlist) return {}

  return {
    title: `${wishlist.title || t("myList")} - Wishlist`,
  }
}

export default async function WishlistPage({ params }: Props) {
  const { id } = params

  return (
    <Suspense fallback={<WishlistSkeleton />}>
      <Wishlist id={id} />
    </Suspense>
  )
}
