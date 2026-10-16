import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getFollowedWishlistsForUser } from "@/lib/wishlists/getFollowedWishlistsForUser"
import { getTranslations } from "next-intl/server"
import { AddTile } from "@/components/AddTile"
import { GroupTile } from "@/components/GroupTile"
import { NewGroup } from "@/components/NewGroup"
import { WishlistTile } from "@/components/WishlistTile"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "ForOthers" })

  return {
    title: t("title"),
  }
}

export default async function ForOthersPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/for-others")}`)
  }

  const groups = await getGroupsForUser()
  const followedWishlists = await getFollowedWishlistsForUser()
  const t = await getTranslations("ForOthers")

  return (
    <>
      <List>
        <ListTitle>{t("groups.title")}</ListTitle>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {groups.map(group => (
            <GroupTile key={group.id} group={group} />
          ))}
          <NewGroup trigger={<AddTile label={t("groups.new")} />} />
        </div>

        {groups.length === 0 && (
          <EmptyState title={t("groups.empty.title")}>
            {t("groups.empty.text")}
          </EmptyState>
        )}
      </List>

      {followedWishlists.length > 0 && (
        <List>
          <ListTitle>{t("followed.title")}</ListTitle>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {followedWishlists.map(wishlist => (
              <WishlistTile key={wishlist.id} wishlist={wishlist} />
            ))}
          </div>
        </List>
      )}
    </>
  )
}
