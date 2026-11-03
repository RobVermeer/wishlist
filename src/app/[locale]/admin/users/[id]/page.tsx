import { Metadata } from "next"
import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { BackLink } from "@/components/BackLink"
import { ListTitle } from "@/components/ListTitle"
import { getUserForAdmin } from "@/lib/users/getUserForAdmin"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { RemoveItem } from "./components/RemoveItem"
import { RemoveWishlist } from "./components/RemoveWishlist"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSession } from "@/lib/getSession"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await getUserForAdmin(id)

  if (!user) return {}

  return {
    title: `${user.name || user.firstName} - Niet Weer Sokken`,
  }
}

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  if (!session) redirect("/login")

  const user = await getUserForAdmin(id)
  const t = await getTranslations("Admin")

  if (!user) {
    notFound()
  }

  return (
    <List>
      <BackLink href="/admin/users" label={t("tabs.users")} />
      <ListTitle>{user.name}</ListTitle>
      <p>{t("user.text")}</p>

      {user.wishlists.length === 0 && <p>{t("user.noWishlists")}</p>}

      {user.wishlists.map(wishlist => {
        const name = getWishlistName({ ...wishlist, user })

        return (
          <section
            key={wishlist.id}
            aria-labelledby={`wishlist-${wishlist.id}`}
            className="grid gap-2 mt-4"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <h3
                id={`wishlist-${wishlist.id}`}
                className="text-xl font-semibold"
              >
                {name}
              </h3>
              <RemoveWishlist id={wishlist.id} name={name} />
            </div>

            {wishlist.items.length === 0 && (
              <p className="text-muted-foreground">{t("user.noItems")}</p>
            )}

            {wishlist.items.map(item => (
              <Card key={item.id} className="flex flex-wrap gap-2 items-center">
                {item.title}
                {item.bought && (
                  <small className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {t("user.bought")}
                  </small>
                )}
                <RemoveItem
                  id={item.id}
                  title={item.title}
                  bought={item.bought}
                />
              </Card>
            ))}
          </section>
        )
      })}
    </List>
  )
}
