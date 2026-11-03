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
import { ChevronRight, Gift, Plus } from "lucide-react"
import { DrawDetails } from "@/components/DrawDetails"
import { getLotsForUser } from "@/lib/draws/getLotsForUser"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NewGroup } from "@/components/NewGroup"
import { NewWishlist } from "@/components/NewWishlist"
import { getSession } from "@/lib/getSession"
import { Metadata } from "next"
import { JsonLd } from "@/components/JsonLd"
import { Landing } from "@/components/Landing"
import { siteUrl } from "@/lib/siteUrl"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params
  const session = await getSession()

  if (!session) {
    return {
      robots: { index: true, follow: true },
      alternates: { canonical: "/" },
    }
  }

  const t = await getTranslations({ locale, namespace: "Home" })

  return {
    title: t("title"),
  }
}

export default async function Home() {
  const session = await getSession()

  if (!session) {
    const t = await getTranslations("Metadata")

    return (
      <>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Niet Weer Sokken",
            url: siteUrl.origin,
            description: t("description"),
            inLanguage: "nl",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          }}
        />
        <Landing />
      </>
    )
  }

  const groups = await getGroupsForUser()
  const wishlists = await getWishlistsForUser()
  const followedWishlists = await getFollowedWishlistsForUser()
  const lots = await getLotsForUser()
  const t = await getTranslations("Home")
  const format = await getFormatter()

  const ownListGroups = (wishlist: (typeof wishlists)[number]) =>
    wishlist.groups.length > 0
      ? t("wishlists.groups", {
          count: wishlist.groups.length,
          names: format.list(wishlist.groups.map(({ title }) => title)),
        })
      : null

  // null leaves the details line empty, so the title stays level with its neighbours
  const renderWishlist = (
    wishlist: (typeof wishlists)[number] | (typeof followedWishlists)[number],
    details?: string | null
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
        {details !== undefined && (
          <small className="min-h-4 text-xs text-muted-foreground">
            {details}
          </small>
        )}
      </span>
    </Link>
  )

  const hasWishlists = wishlists.length > 0
  const isFollowing = groups.length > 0 || followedWishlists.length > 0

  const newWishlist = (
    <NewWishlist
      groups={await getGroupOptionsForUser()}
      managers={await getManagerOptionsForUser()}
      trigger={
        hasWishlists ? (
          // Short on phones, so it fits next to the section title.
          <Button variant="outline" size="sm" aria-label={t("wishlists.new")}>
            <Plus size="16" className="mr-2" />
            <span className="sm:hidden">{t("wishlists.newShort")}</span>
            <span className="max-sm:hidden">{t("wishlists.new")}</span>
          </Button>
        ) : (
          <Button>
            <Plus size="16" className="mr-2" /> {t("wishlists.new")}
          </Button>
        )
      }
    />
  )

  const newGroup = (
    <NewGroup
      hasWishlist={hasWishlists}
      trigger={
        <Button variant="outline" size={isFollowing ? "sm" : "default"}>
          <Plus size="16" className="mr-2" /> {t("following.newGroup")}
        </Button>
      }
    />
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
                  className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3 transition-colors hover:bg-secondary/70"
                >
                  <Gift
                    aria-hidden
                    size="18"
                    className="shrink-0 text-primary"
                  />
                  <div className="grid">
                    <span className="font-medium">{lot.group.title}</span>
                    <DrawDetails budget={lot.budget} date={lot.date} />
                  </div>
                  <ChevronRight
                    aria-hidden
                    size="18"
                    className="ml-auto shrink-0 text-muted-foreground"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </List>
      )}

      <section aria-labelledby="following-title" className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <ListTitle>
            <span id="following-title">{t("following.title")}</span>
          </ListTitle>
          {isFollowing && newGroup}
        </div>

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
        </div>

        {!isFollowing && (
          <div className="grid justify-items-start gap-4">
            <EmptyState title={t("following.empty.title")}>
              {t("following.empty.text")}
            </EmptyState>
            {newGroup}
          </div>
        )}
      </section>

      <section aria-labelledby="wishlists-title" className="grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <ListTitle>
            <span id="wishlists-title">{t("wishlists.title")}</span>
          </ListTitle>
          {hasWishlists && newWishlist}
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
          {wishlists.map(wishlist =>
            renderWishlist(wishlist, ownListGroups(wishlist))
          )}
        </div>

        {!hasWishlists && (
          <div className="grid justify-items-start gap-4">
            <EmptyState title={t("wishlists.empty.title")}>
              {t("wishlists.empty.text")}
            </EmptyState>
            {newWishlist}
          </div>
        )}
      </section>
    </>
  )
}
