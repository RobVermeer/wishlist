import Link from "next/link"
import { LogIn } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { FollowWishlist } from "@/components/FollowWishlist"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Button } from "@/components/ui/button"
import type { getWishlistByShareToken } from "@/lib/wishlists/getWishlistByShareToken"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"

interface Props {
  wishlist: NonNullable<Awaited<ReturnType<typeof getWishlistByShareToken>>>
  shareToken: string
  loggedIn: boolean
}

export const SharedWishlist = async ({
  wishlist,
  shareToken,
  loggedIn,
}: Props) => {
  const t = await getTranslations("SharedWishlist")
  const name = getWishlistName(wishlist)
  const action = loggedIn ? "follow" : "loggedOut"

  return (
    <List>
      <div className="text-center">
        <ListTitle>{name}</ListTitle>
        <p>{t("intro", { name })}</p>
      </div>

      <section className="grid gap-2 rounded-lg bg-secondary p-4 text-center">
        <h3 className="text-lg font-semibold">{t(`${action}.title`)}</h3>
        <p className="text-sm text-muted-foreground">{t(`${action}.text`)}</p>

        {loggedIn ? (
          <FollowWishlist shareToken={shareToken} text={t("follow.button")} />
        ) : (
          <Button asChild>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/lijstje/${shareToken}`)}`}
            >
              <LogIn size="16" className="mr-2" /> {t("loggedOut.button")}
            </Link>
          </Button>
        )}
      </section>
    </List>
  )
}
