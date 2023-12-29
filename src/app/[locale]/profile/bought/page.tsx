import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { authOptions } from "../../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

interface Props {
  params: { locale: string }
}

export const generateMetadata = async ({ params: { locale } }: Props) => {
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

  return (
    <List>
      {boughtWishlistItems.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {boughtWishlistItems.map((item) => (
        <Card key={item.id}>
          {item.title}{" "}
          <small className="block text-muted-foreground">
            {t("boughtFor", {
              name:
                item.wishlist.title ||
                item.wishlist.user.firstName ||
                item.wishlist.user.name?.split(" ")[0],
            })}
          </small>
        </Card>
      ))}
    </List>
  )
}
