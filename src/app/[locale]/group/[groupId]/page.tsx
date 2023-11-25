import { EmptyState } from "@/components/EmptyState"
import { FollowGroup } from "@/components/FollowGroup"
import { Layout } from "@/components/Layout"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ShareButton } from "@/components/ShareButton"
import { WishlistCard } from "@/components/WishlistCard"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const group = await getGroupById(params.groupId)

  if (!group) return {}

  return {
    title: `${group.title} - Wishlist`,
  }
}

interface Props {
  params: { groupId: string }
}

export default async function GroupPage({ params }: Props) {
  const group = await getGroupById(params.groupId)

  if (!group) {
    notFound()
  }

  if (!group.subscribed) {
    return (
      <Layout>
        <EmptyState title="😵 Je volgt deze groep nog niet 😵">
          Volg de groep snel om alle lijstjes te kunnen zien! 😇
        </EmptyState>
        <FollowGroup group={group} />
      </Layout>
    )
  }

  return (
    <List>
      <ListTitle>{group.title}</ListTitle>

      {group.wishlist.map((wishlist) => (
        <WishlistCard key={wishlist.id} wishlist={wishlist} group={group} />
      ))}

      {group.wishlist.length === 0 && (
        <EmptyState title="😵‍💫 Er zijn nog geen lijstjes! 😵‍💫">
          Maak als eerste een lijstje aan in{" "}
          <Link className="text-primary" href="/profile">
            je profiel
          </Link>
          ! 🤑
        </EmptyState>
      )}

      <Separator className="my-3" />

      <ShareButton group={group} />
    </List>
  )
}