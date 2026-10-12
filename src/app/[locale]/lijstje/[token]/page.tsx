import { Metadata } from "next"
import { getServerSession } from "next-auth"
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

  return {
    title: `${getWishlistName(wishlist)} - Wishlist`,
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
