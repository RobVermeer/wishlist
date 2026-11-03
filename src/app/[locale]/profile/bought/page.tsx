import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/getSession"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { redirect } from "next/navigation"
import { ShowMore } from "@/components/ShowMore"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({
    locale,
    namespace: "ProfileBoughtPresents",
  })

  return {
    title: t("title"),
  }
}

const maxShown = 15

export default async function ProfileBoughtPage() {
  const session = await getSession()

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/profile/bought")}`)
  }

  const boughtWishlistItems = await getBoughtWishlistItemsForUser()
  const t = await getTranslations("ProfileBoughtPresents")

  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const isEarlier = (item: (typeof boughtWishlistItems)[number]) =>
    item.boughtAt !== null && item.boughtAt < yearAgo
  const recent = boughtWishlistItems.filter(item => !isEarlier(item))
  const shown = recent.slice(0, maxShown)
  const more = [
    ...recent.slice(maxShown),
    ...boughtWishlistItems.filter(isEarlier),
  ]

  const renderItem = (item: (typeof boughtWishlistItems)[number]) => (
    <Card key={item.id}>
      <div className="sm:flex sm:items-baseline sm:justify-between sm:gap-4">
        {item.title}{" "}
        <small className="block shrink-0 text-muted-foreground">
          {item.boughtAt
            ? t("boughtForOn", {
                name: getWishlistName(item.wishlist),
                date: item.boughtAt,
              })
            : t("boughtFor", { name: getWishlistName(item.wishlist) })}
        </small>
      </div>
      {(item.wishlist.removed || item.removed) && (
        <small className="block text-muted-foreground">
          {item.wishlist.removed ? t("removedWishlist") : t("removedItem")}
        </small>
      )}
    </Card>
  )

  return (
    <List>
      {boughtWishlistItems.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {shown.map(renderItem)}

      {more.length > 0 && (
        <ShowMore label={t("showMore", { count: more.length })}>
          {more.map(renderItem)}
        </ShowMore>
      )}
    </List>
  )
}
