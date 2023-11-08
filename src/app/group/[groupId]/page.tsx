import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistCard } from "@/components/WishlistCard"
import { Button } from "@/components/ui/button"
import { getGroupById } from "@/lib/groups/getGroupById"
import Link from "next/link"

export default async function GroupPage({ params }) {
  const group = await getGroupById(params.groupId)

  if (!group.subscribed) {
    return (
      <Layout>
        <EmptyState title="😵 Je volgt deze groep nog niet 😵">
          Volg de groep snel om alle lijstjes te kunnen zien! 😇
          <Button>Volg de groep</Button>
        </EmptyState>
      </Layout>
    )
  }

  if (group.wishlist.length === 0) {
    return (
      <Layout>
        <EmptyState title="😵‍💫 Er zijn nog geen lijstjes! 😵‍💫">
          Maak als eerste een lijstje aan in{" "}
          <Link href="/profile">je profiel</Link>! 🤑
        </EmptyState>
      </Layout>
    )
  }

  return (
    <Layout>
      <List>
        <ListTitle>{group.title}</ListTitle>

        {group.wishlist.map((wishlist) => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} group={group} />
        ))}
      </List>
    </Layout>
  )
}
