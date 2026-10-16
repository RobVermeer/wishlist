import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { getTranslations } from "next-intl/server"
import { AddTile } from "@/components/AddTile"
import { NewWishlist } from "@/components/NewWishlist"
import { WishlistTile } from "@/components/WishlistTile"
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
  const t = await getTranslations("Home")

  return (
    <List>
      <ListTitle>{t("wishlists.title")}</ListTitle>

      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
        {wishlists.map(wishlist => (
          <WishlistTile key={wishlist.id} wishlist={wishlist} />
        ))}
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
  )
}
