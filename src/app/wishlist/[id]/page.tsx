import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { Metadata } from "next"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wishlist = await getWishlistById(params.id, true)

  return {
    title: `${wishlist.title || "Mijn lijstje"} - Wishlist`,
  }
}

interface Props {
  params: { id: string }
}

export default async function WishlistPage({ params }: Props) {
  const wishlist = await getWishlistById(params.id, true)

  return (
    <Layout>
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

        <NewItem id={wishlist.id} />
      </List>
    </Layout>
  )
}
