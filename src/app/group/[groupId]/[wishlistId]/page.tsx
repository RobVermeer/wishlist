import { EmptyState } from "@/components/EmptyState"
import { ItemCard } from "@/components/ItemCard"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import Link from "next/link"

interface Props {
  params: { wishlistId: string; groupId: string }
}

export default async function GroupWishlistPage({ params }: Props) {
  const wishlist = await getWishlistById(params.wishlistId)
  const group = await getGroupById(params.groupId)

  if (wishlist.isOwnList) {
    return (
      <Layout>
        <EmptyState title="🥸 Dit is je eigen lijstje 🥸">
          Je mag natuurlijk niet zien wat anderen al hebben gekocht, maar als je
          je lijstje wilt aanpassen, dan kan dat op{" "}
          <Link href="/profile">je profiel</Link>! 🤩
        </EmptyState>
      </Layout>
    )
  }

  return (
    <Layout>
      <List>
        <ListTitle>
          <WishlistTitle wishlist={wishlist} />{" "}
          <small>
            In <Link href={`/group/${group.id}`}>{group.title}</Link>
          </small>
        </ListTitle>

        {wishlist.wishlistItem.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}

        {wishlist.wishlistItem.length === 0 && (
          <EmptyState title="🫣 Dit lijstje is nog helemaal leeg 🫣">
            Wel zo goedkoop, alleen misschien moeten we er toch maar wat van
            gaan zeggen! 👮
          </EmptyState>
        )}
      </List>
    </Layout>
  )
}