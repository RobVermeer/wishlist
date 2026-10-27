import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { authOptions } from "@/lib/nextAuth"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { redirect } from "next/navigation"
import { ChevronDown } from "lucide-react"

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

export default async function ProfileBoughtPage() {
  const session = await getServerSession(authOptions)

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
  const earlier = boughtWishlistItems.filter(isEarlier)

  const renderItem = (item: (typeof boughtWishlistItems)[number]) => (
    <Card key={item.id}>
      {item.title}{" "}
      <small className="block text-muted-foreground">
        {item.boughtAt
          ? t("boughtForOn", {
              name: getWishlistName(item.wishlist),
              date: item.boughtAt,
            })
          : t("boughtFor", { name: getWishlistName(item.wishlist) })}
      </small>
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

      {recent.map(renderItem)}

      {earlier.length > 0 && (
        <details className="group grid gap-2">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold [&::-webkit-details-marker]:hidden">
            {t("earlier.title", { count: earlier.length })}
            <ChevronDown
              aria-hidden
              size="16"
              className="text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <p className="mb-2 text-sm text-muted-foreground">
            {t("earlier.text")}
          </p>
          <div className="grid gap-2">{earlier.map(renderItem)}</div>
        </details>
      )}
    </List>
  )
}
