import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { getTranslations } from "next-intl/server"

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
  const wishlist = await getWishlistById(params.id, true)

  if (!wishlist) {
    notFound()
  }

  return (
    <List>
      <ListTitle>
        <WishlistTitle wishlist={wishlist} />
      </ListTitle>

      {wishlist.wishlistItem.map((item) => (
        <YourItemCard key={item.id} item={item} />
      ))}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title="Je hebt nog geen wensen!">
          Maak er snel wat aan! 😎
        </EmptyState>
      )}

      <Separator className="my-3" />

      <NewItem id={wishlist.id} />
    </List>
  )
}
