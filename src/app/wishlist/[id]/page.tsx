import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { Metadata } from "next"
import { Header } from "@/components/Header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wishlist = await getWishlistById(params.id, true)

  if (!wishlist) return {}

  return {
    title: `${wishlist.title || "Mijn lijstje"} - Wishlist`,
  }
}

interface Props {
  params: { id: string }
}

export default async function WishlistPage({ params }: Props) {
  const wishlist = await getWishlistById(params.id, true)
  const session = await getServerSession(authOptions)

  if (!wishlist) {
    notFound()
  }

  return (
    <>
      <Header session={session} />
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
    </>
  )
}
