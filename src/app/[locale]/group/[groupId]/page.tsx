import { EmptyState } from "@/components/EmptyState"
import { FollowGroup } from "@/components/FollowGroup"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ShareButton } from "@/components/ShareButton"
import { WishlistCard } from "@/components/WishlistCard"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/nextAuth"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params
  const group = await getGroupById(groupId)

  if (!group) return {}

  return {
    title: `${group.title} - Wishlist`,
  }
}

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/group/${groupId}`)}`)
  }

  const group = await getGroupById(groupId)
  const t = await getTranslations("Group")

  if (!group) {
    notFound()
  }

  if (!group.subscribed) {
    return (
      <>
        <EmptyState title={t("noFollow.title")}>
          {t("noFollow.text")}
        </EmptyState>
        <FollowGroup group={group} text={t("follow")} />
      </>
    )
  }

  return (
    <List>
      <ListTitle>{group.title}</ListTitle>

      {group.wishlist.map(wishlist => (
        <WishlistCard key={wishlist.id} wishlist={wishlist} group={group} />
      ))}

      {group.wishlist.length === 0 && (
        <EmptyState title={t("empty.title")}>
          {t.rich("empty.text", {
            profile: chunks => (
              <Link href="/profile/wishlists" className="text-primary">
                {chunks}
              </Link>
            ),
          })}
        </EmptyState>
      )}

      <Separator className="my-3" />

      <ShareButton group={group} />
    </List>
  )
}
