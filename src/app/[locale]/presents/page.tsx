import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ToggleItem } from "@/components/ToggleItem"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { authOptions } from "@/lib/nextAuth"
import { Link as LinkIcon } from "lucide-react"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Presents" })

  return {
    title: t("metaTitle"),
  }
}

export default async function PresentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/presents")}`)
  }

  const presents = await getBoughtWishlistItemsForUser()
  const t = await getTranslations("Presents")

  return (
    <List>
      <ListTitle>{t("title")}</ListTitle>

      {presents.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {presents.map(({ wishlist, items }) => (
        <section key={wishlist.id} className="grid gap-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xl">
              {t("for", {
                name:
                  wishlist.title ||
                  wishlist.user.firstName ||
                  wishlist.user.name?.split(" ")[0] ||
                  "",
              })}
            </h3>
            <Link
              href={`/wishlist/${wishlist.id}`}
              className="shrink-0 text-sm text-primary"
            >
              {t("viewWishlist")}
            </Link>
          </div>

          {items.map(({ id, title, url }) => (
            <Card key={id} className="flex items-center gap-2">
              <span className="flex-1">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <LinkIcon
                      size="16"
                      strokeWidth="2.5"
                      className="inline mr-1"
                    />{" "}
                    {title}
                  </a>
                ) : (
                  title
                )}
              </span>
              <ToggleItem id={id} boughtByMe />
            </Card>
          ))}
        </section>
      ))}
    </List>
  )
}
