import { EmptyState } from "@/components/EmptyState"
import { ItemCard } from "@/components/ItemCard"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { NewItem } from "@/components/NewItem"
import { RemindButton } from "@/components/RemindButton"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { canBeRemindedForUser } from "@/lib/reminders"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wishlist = await getWishlistById(params.wishlistId)
  const group = await getGroupById(params.groupId)

  if (!wishlist || !group) return {}

  return {
    title: `${
      wishlist.title ||
      wishlist.user.firstName ||
      wishlist.user.name?.split(" ")[0]
    } - ${group.title} - Wishlist`,
  }
}

interface Props {
  params: { wishlistId: string; groupId: string }
}

export default async function GroupWishlistPage({ params }: Props) {
  const wishlist = await getWishlistById(params.wishlistId)
  const group = await getGroupById(params.groupId)
  const t = await getTranslations("GroupWishlist")

  if (!wishlist || !group) {
    notFound()
  }

  const canBeReminded = await canBeRemindedForUser(wishlist.user.id)

  return (
    <List>
      <ListTitle>
        <WishlistTitle wishlist={wishlist} />{" "}
        <small className="text-secondary-foreground">
          In{" "}
          <Link
            className="underline underline-offset-2"
            href={`/group/${group.id}`}
          >
            {group.title}
          </Link>
        </small>
      </ListTitle>

      {wishlist.wishlistItem.map((item) => {
        if (wishlist.isOwnList) {
          return <YourItemCard key={item.id} item={item} />
        }

        return <ItemCard key={item.id} item={item} />
      })}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {(wishlist.isOwnList || canBeReminded) && <Separator className="my-3" />}

      {wishlist.isOwnList && <NewItem id={wishlist.id} />}

      {canBeReminded && !wishlist.isOwnList && (
        <RemindButton wishlist={wishlist} />
      )}
    </List>
  )
}
