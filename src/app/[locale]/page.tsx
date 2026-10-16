import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { getFollowedWishlistsForUser } from "@/lib/wishlists/getFollowedWishlistsForUser"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { WishlistIcon } from "@/components/WishlistIcon"
import { AddTile } from "@/components/AddTile"
import { NewGroup } from "@/components/NewGroup"
import { NewWishlist } from "@/components/NewWishlist"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Home" })

  return {
    title: t("title"),
  }
}

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const groups = await getGroupsForUser()
  const wishlists = await getWishlistsForUser()
  const followedWishlists = await getFollowedWishlistsForUser()
  const t = await getTranslations("Home")

  const renderWishlist = (
    wishlist: (typeof wishlists)[number] | (typeof followedWishlists)[number]
  ) => (
    <Link
      key={wishlist.id}
      href={`/wishlist/${wishlist.id}`}
      className="group aspect-video flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all"
    >
      <WishlistIcon
        theme={wishlist.theme}
        className="absolute group-hover:text-primary opacity-20 group-hover:opacity-100 relative -top-4 transition-all"
      />
      <WishlistTitle
        className="text-center px-2 absolute bottom-3"
        wishlist={wishlist}
      />
    </Link>
  )

  return (
    <>
      <List>
        <ListTitle>{t("groups.title")}</ListTitle>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/group/${group.id}`}
              className="relative overflow-hidden group aspect-video flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all bg-cover bg-center"
              style={{
                backgroundImage: `url('/theme/${
                  group?.theme || "background"
                }.webp')`,
              }}
            >
              <div className="absolute inset-0 translate-y-1/3 bg-linear-to-b from-transparent to-black" />
              <span className="text-center px-2 absolute bottom-3 text-primary-foreground">
                {group.title}
              </span>
            </Link>
          ))}
          <NewGroup trigger={<AddTile label={t("groups.new")} />} />
        </div>

        {groups.length === 0 && (
          <EmptyState title={t("groups.empty.title")}>
            {t("groups.empty.text")}
          </EmptyState>
        )}
      </List>

      <List>
        <ListTitle>{t("wishlists.title")}</ListTitle>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {wishlists.map(renderWishlist)}
          <NewWishlist
            groups={groups}
            trigger={<AddTile label={t("wishlists.new")} />}
          />
        </div>

        {wishlists.length === 0 && (
          <EmptyState title={t("wishlists.empty.title")}>
            {t("wishlists.empty.text")}
          </EmptyState>
        )}
      </List>

      {followedWishlists.length > 0 && (
        <List>
          <ListTitle>{t("followed.title")}</ListTitle>

          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
            {followedWishlists.map(renderWishlist)}
          </div>
        </List>
      )}
    </>
  )
}
