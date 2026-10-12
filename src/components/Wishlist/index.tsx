import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { getTranslations } from "next-intl/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { getGroupById } from "@/lib/groups/getGroupById"
import { canBeRemindedForUser } from "@/lib/reminders"
import { RemindButton } from "../RemindButton"
import { ItemCard } from "../ItemCard"
import Link from "next/link"
import { CategoryList } from "../CategoryList"

interface Props {
  id: string
  groupId?: string
}

export const Wishlist = async ({ id, groupId }: Props) => {
  const wishlist = await getWishlistById(id)
  const group = groupId ? await getGroupById(groupId) : null
  const t = await getTranslations("GroupWishlist")

  if (!wishlist) {
    notFound()
  }

  const canBeReminded = await canBeRemindedForUser(wishlist.user.id)
  const categoryTitles = wishlist.categories.map(({ title }) => title)

  const renderItem = (item: (typeof wishlist.wishlistItem)[number]) => {
    if (wishlist.isOwnList) {
      return (
        <YourItemCard key={item.id} item={item} categories={categoryTitles} />
      )
    }

    return <ItemCard key={item.id} item={item} />
  }

  const uncategorizedItems = wishlist.wishlistItem.filter(
    item => !item.category
  )
  const categories = wishlist.categories
    .map(category => {
      const items = wishlist.wishlistItem.filter(
        item => item.category?.id === category.id
      )

      return {
        id: category.id,
        title: category.title,
        count: items.length,
        items: items.map(renderItem),
      }
    })
    .filter(({ count }) => count > 0)

  return (
    <List>
      <div className="text-center">
        {!wishlist.title && wishlist.user.image && (
          <Avatar className="inline-block w-14 h-14 border border-slate-500">
            <AvatarImage
              src={wishlist.user.image}
              alt={`@${wishlist.user.name}`}
            />
            <AvatarFallback>{getInitials(wishlist.user.name)}</AvatarFallback>
          </Avatar>
        )}
        <ListTitle>
          <WishlistTitle wishlist={wishlist} />{" "}
          {group && (
            <small className="text-base text-foreground">
              In{" "}
              <Link
                className="underline underline-offset-2"
                href={`/group/${group.id}`}
              >
                {group.title}
              </Link>
            </small>
          )}
        </ListTitle>

        {wishlist.description && (
          <small className="italic text-sm">{wishlist.description}</small>
        )}
      </div>

      {uncategorizedItems.map(renderItem)}

      {categories.length > 0 && (
        <CategoryList
          wishlistId={wishlist.id}
          categories={categories}
          sortable={wishlist.isOwnList}
        />
      )}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {(wishlist.isOwnList || canBeReminded) && <Separator className="my-3" />}

      {wishlist.isOwnList && (
        <NewItem id={wishlist.id} categories={categoryTitles} />
      )}

      {canBeReminded && !wishlist.isOwnList && (
        <RemindButton wishlist={wishlist} />
      )}
    </List>
  )
}
