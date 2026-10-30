import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { openGraphImage } from "@/lib/openGraph"
import { notFound, redirect } from "next/navigation"
import { SharedWishlist } from "@/components/SharedWishlist"
import { authOptions } from "@/lib/nextAuth"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { getWishlistByShareToken } from "@/lib/wishlists/getWishlistByShareToken"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const wishlist = await getWishlistByShareToken(token)

  if (!wishlist) return {}

  const name = getWishlistName(wishlist)
  const t = await getTranslations("SharedWishlist.preview")

  // A preview in WhatsApp and the like, but no search results: the layout
  // keeps this page out of the index.
  return {
    title: `${name} - Niet Weer Sokken`,
    openGraph: {
      type: "website",
      siteName: "Niet Weer Sokken",
      locale: "nl_NL",
      title: t("title", { name }),
      description: t("text", { name }),
      images: [openGraphImage],
    },
  }
}

export default async function SharedWishlistPage({ params }: Props) {
  const { token } = await params
  const wishlist = await getWishlistByShareToken(token)

  if (!wishlist) {
    notFound()
  }

  const session = await getServerSession(authOptions)

  if (session && (await getWishlistById(wishlist.id))) {
    redirect(`/wishlist/${wishlist.id}`)
  }

  return (
    <SharedWishlist
      wishlist={wishlist}
      shareToken={token}
      loggedIn={Boolean(session)}
    />
  )
}
