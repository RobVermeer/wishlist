import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { ScrollText } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

interface Props {
  params: { locale: string }
}

export const generateMetadata = async ({ params: { locale } }: Props) => {
  const t = await getTranslations({ locale, namespace: "Home" })

  return {
    title: t("title"),
  }
}

export default async function Home() {
  const groups = await getGroupsForUser()
  const wishlists = await getWishlistsForUser()
  const t = await getTranslations("Home")

  return (
    <>
      <List>
        <ListTitle>{t("groups.title")}</ListTitle>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {groups.map((group) => (
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
              <div className="absolute inset-0 translate-y-1/3 bg-gradient-to-b from-transparent to-black" />
              <span className="text-center px-2 absolute bottom-3 text-primary-foreground">
                {group.title}
              </span>
            </Link>
          ))}
        </div>

        {groups.length === 0 && (
          <EmptyState title={t("groups.empty.title")}>
            {t.rich("groups.empty.text", {
              profile: (chunks) => (
                <Link href="/profile" className="text-primary">
                  {chunks}
                </Link>
              ),
            })}
          </EmptyState>
        )}
      </List>

      <List>
        <ListTitle>{t("wishlists.title")}</ListTitle>

        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
          {wishlists.map((wishlist) => (
            <Link
              key={wishlist.id}
              href={`/wishlist/${wishlist.id}`}
              className="group aspect-video flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all"
            >
              <ScrollText
                size="32"
                strokeWidth="2"
                className="absolute group-hover:text-primary opacity-20 group-hover:opacity-100 relative -top-4 transition-all"
              />
              <WishlistTitle
                className="text-center px-2 absolute bottom-3"
                wishlist={wishlist}
              />
            </Link>
          ))}
        </div>

        {wishlists.length === 0 && (
          <EmptyState title={t("wishlists.empty.title")}>
            {t.rich("wishlists.empty.text", {
              profile: (chunks) => (
                <Link href="/profile/wishlists" className="text-primary">
                  {chunks}
                </Link>
              ),
            })}
          </EmptyState>
        )}
      </List>
    </>
  )
}
