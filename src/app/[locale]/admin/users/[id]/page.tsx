import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getUserForAdmin } from "@/lib/users/getUserForAdmin"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { RemoveBoughtItem } from "./components/RemoveBoughtItem"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminUserPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const user = await getUserForAdmin(id)
  const t = await getTranslations("Admin")

  if (!user) {
    notFound()
  }

  return (
    <List>
      <ListTitle>{user.name}</ListTitle>
      <p>{t("user.text")}</p>

      {user.wishlists.length === 0 && <p>{t("user.noWishlists")}</p>}

      {user.wishlists.map(wishlist => (
        <section key={wishlist.id} className="grid gap-2 mt-4">
          <h3 className="text-xl font-semibold">
            {getWishlistName({ ...wishlist, user })}
          </h3>

          {wishlist.items.length === 0 && (
            <p className="text-muted-foreground">{t("user.noItems")}</p>
          )}

          {wishlist.items.map(item => (
            <Card key={item.id} className="flex flex-wrap gap-2 items-center">
              {item.title}
              {item.bought && (
                <>
                  <small className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {t("user.bought")}
                  </small>
                  <RemoveBoughtItem id={item.id} title={item.title} />
                </>
              )}
            </Card>
          ))}
        </section>
      ))}
    </List>
  )
}
