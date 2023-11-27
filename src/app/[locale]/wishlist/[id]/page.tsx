import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { getMessages, getTranslations } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { pickMessages } from "@/utils/pick"

interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const t = await getTranslations({ locale, namespace: "Common" })
  const wishlist = await getWishlistById(id, true)

  if (!wishlist) return {}

  return {
    title: `${wishlist.title || t("myList")} - Wishlist`,
  }
}

export default async function WishlistPage({ params }: Props) {
  const { id, locale } = params
  const wishlist = await getWishlistById(id, true)
  const t = await getTranslations({ locale, namespace: "Common" })
  const messages = await getMessages()

  if (!wishlist) {
    notFound()
  }

  return (
    <List>
      <ListTitle>
        <WishlistTitle wishlist={wishlist} />
      </ListTitle>

      {wishlist.wishlistItem.map((item) => (
        <YourItemCard key={item.id} item={item} />
      ))}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      <Separator className="my-3" />

      <NextIntlClientProvider messages={pickMessages(messages, "NewItem")}>
        <NewItem id={wishlist.id} />
      </NextIntlClientProvider>
    </List>
  )
}
