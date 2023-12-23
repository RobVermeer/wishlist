import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { NewWishlist } from "@/components/NewWishlist"
import { YourWishlistCard } from "@/components/YourWishlistCard"
import { Separator } from "@/components/ui/separator"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { pickMessages } from "@/utils/pick"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"

interface Props {
  params: { locale: string }
}

export const generateMetadata = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "ProfileWishlists" })

  return {
    title: t("title"),
  }
}

export default async function ProfilePage() {
  const wishlists = await getWishlistsForUser()
  const groups = await getGroupsForUser()
  const t = await getTranslations("ProfileWishlists")
  const messages = await getMessages()

  return (
    <List>
      {wishlists.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {wishlists.map((wishlist) => (
        <YourWishlistCard
          key={wishlist.id}
          wishlist={wishlist}
          groups={groups}
        />
      ))}

      <Separator className="my-3" />

      <NextIntlClientProvider
        messages={pickMessages(messages, ["NewWishlist", "Common"])}
      >
        <NewWishlist groups={groups} />
      </NextIntlClientProvider>
    </List>
  )
}