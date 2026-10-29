import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getGroupOptionsForUser } from "@/lib/groups/getGroupOptionsForUser"
import { groupBackground } from "@/lib/groups/themes"
import { getManagerOptionsForUser } from "@/lib/users/getManagerOptionsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { getFollowedWishlistsForUser } from "@/lib/wishlists/getFollowedWishlistsForUser"
import Link from "next/link"
import { getFormatter, getTranslations } from "next-intl/server"
import { WishlistIcon, wishlistColors } from "@/components/WishlistIcon"
import { Gift } from "lucide-react"
import { DrawDetails } from "@/components/DrawDetails"
import { getLotsForUser } from "@/lib/draws/getLotsForUser"
import { cn } from "@/lib/utils"
import { AddTile } from "@/components/AddTile"
import { NewGroup } from "@/components/NewGroup"
import { NewWishlist } from "@/components/NewWishlist"
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
  const followedWishlists = await getFollowedWishlistsForUser()
  const lots = await getLotsForUser()
  const t = await getTranslations("Home")
  const format = await getFormatter()

  const ownListGroups = (wishlist: (typeof wishlists)[number]) =>
    t("wishlists.groups", {
      count: wishlist.groups.length,
      names: format.list(wishlist.groups.map(({ title }) => title)),
    })

  const renderWishlist = (
    wishlist: (typeof wishlists)[number] | (typeof followedWishlists)[number],
    details?: string
  ) => (
    <Link
      key={wishlist.id}
      href={`/wishlist/${wishlist.id}`}
      className={cn(
        "group relative flex aspect-[4/3] flex-col justify-between rounded-2xl p-4 transition-all hover:-rotate-1 hover:shadow-lg",
        wishlistColors(wishlist.theme)
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-white/70 shadow-sm transition-transform group-hover:scale-110 dark:bg-white/15">
        <WishlistIcon theme={wishlist.theme} className="size-5" />
      </span>
      <span className="grid gap-0.5">
        <WishlistTitle
          className="font-display text-lg font-semibold leading-tight text-foreground"
          wishlist={wishlist}
        />
        {details && (
          <small className="text-xs text-muted-foreground">{details}</small>
        )}
      </span>
    </Link>
  )

  return (
    <>
      <div>
        <h1 className="text-4xl font-semibold tracking-tight">
          {session.user.firstName
            ? t("greeting.name", { name: session.user.firstName })
            : t("greeting.anonymous")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("greeting.text")}</p>
      </div>

      {lots.length > 0 && (
        <List>
          <ListTitle>
            <span id="lots-title">{t("lots.title")}</span>
          </ListTitle>
          <ul aria-labelledby="lots-title" className="grid gap-2">
            {lots.map(lot => (
              <li key={lot.group.id}>
                <Link
                  href={`/group/${lot.group.id}`}
                  className="grid gap-1 rounded-lg bg-secondary p-4 transition-colors hover:bg-secondary/70"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Gift aria-hidden size="16" className="text-primary" />
                    {lot.group.title}
                  </span>
                  <span className="font-display text-xl font-semibold">
                    {t.rich("lots.drawn", {
                      name: lot.receiver,
                      strong: chunks => (
                        <strong className="text-primary">{chunks}</strong>
                      ),
                    })}
                  </span>
                  <DrawDetails budget={lot.budget} date={lot.date} />
                </Link>
              </li>
            ))}
          </ul>
        </List>
      )}

      <List>
        <ListTitle>{t("following.title")}</ListTitle>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {groups.map(group => (
            <Link
              key={group.id}
              href={`/group/${group.id}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl bg-cover bg-center p-4 text-white shadow-sm transition-all hover:-rotate-1 hover:shadow-lg"
              style={{ backgroundImage: groupBackground(group.theme) }}
            >
              <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/20 to-transparent" />
              <span className="relative font-display text-lg font-semibold leading-tight">
                {group.title}
              </span>
              <span className="relative text-xs text-white/80">
                {t("following.members", { count: group.members.length })}
              </span>
            </Link>
          ))}
          {followedWishlists.map(wishlist => renderWishlist(wishlist))}
          <NewGroup
            hasWishlist={wishlists.length > 0}
            trigger={<AddTile label={t("following.newGroup")} />}
          />
        </div>

        {groups.length === 0 && followedWishlists.length === 0 && (
          <EmptyState title={t("following.empty.title")}>
            {t("following.empty.text")}
          </EmptyState>
        )}
      </List>

      <List>
        <ListTitle>{t("wishlists.title")}</ListTitle>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {wishlists.map(wishlist =>
            renderWishlist(
              wishlist,
              wishlist.title ? undefined : ownListGroups(wishlist)
            )
          )}
          <NewWishlist
            groups={await getGroupOptionsForUser()}
            managers={await getManagerOptionsForUser()}
            trigger={<AddTile label={t("wishlists.new")} />}
          />
        </div>

        {wishlists.length === 0 && (
          <EmptyState title={t("wishlists.empty.title")}>
            {t("wishlists.empty.text")}
          </EmptyState>
        )}
      </List>
    </>
  )
}
