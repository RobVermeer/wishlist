import { EmptyState } from "@/components/EmptyState"
import { FollowGroup } from "@/components/FollowGroup"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ShareButton } from "@/components/ShareButton"
import { WishlistCard } from "@/components/WishlistCard"
import { Wishlist } from "@/components/Wishlist"
import { EditGroup } from "@/components/EditGroup"
import { LeaveGroup } from "@/components/LeaveGroup"
import { AddWishlistToGroup } from "@/components/AddWishlistToGroup"
import { NewWishlist } from "@/components/NewWishlist"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
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
  const tCommon = await getTranslations("Common")

  if (!group) {
    notFound()
  }

  if (!group.subscribed) {
    return (
      <>
        <EmptyState title={t("noFollow.title")}>
          {t("noFollow.text")}
        </EmptyState>
        <FollowGroup groupId={group.id} text={t("follow")} />
      </>
    )
  }

  const ownGroups = await getGroupsForUser()
  const wishlistsToAdd = (await getWishlistsForUser()).filter(
    wishlist => !wishlist.groups.some(({ id }) => id === group.id)
  )
  const [onlyWishlist] = group.wishlist
  const showOnlyWishlist =
    group.wishlist.length === 1 && !onlyWishlist.isOwnList

  return (
    <List>
      <div className="flex items-start justify-between gap-2">
        <ListTitle>{group.title}</ListTitle>
        {group.createdBy.id === session.user.id ? (
          <EditGroup group={group} className="shrink-0" />
        ) : (
          <LeaveGroup group={group} className="shrink-0" />
        )}
      </div>

      {showOnlyWishlist ? (
        <Wishlist id={onlyWishlist.id} />
      ) : (
        group.wishlist.map(wishlist => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} group={group} />
        ))
      )}

      {group.wishlist.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      <Separator className="my-3" />

      {wishlistsToAdd.length > 0 && (
        <AddWishlistToGroup
          group={group}
          wishlists={wishlistsToAdd.map(wishlist => ({
            id: wishlist.id,
            name: wishlist.title || tCommon("myList"),
          }))}
        />
      )}
      <NewWishlist
        groups={ownGroups}
        defaultGroupIds={[group.id]}
        trigger={
          <Button variant="outline">
            <Plus size="16" className="mr-2" /> {t("newWishlist")}
          </Button>
        }
      />
      <ShareButton title={group.title} />
    </List>
  )
}
