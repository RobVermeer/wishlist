import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { YourItemCard } from "@/components/YourItemCard"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { NewItem } from "@/components/NewItem"
import { notFound } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { getFormatter, getTranslations } from "next-intl/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { getGroupById } from "@/lib/groups/getGroupById"
import { canBeRemindedForUser } from "@/lib/reminders/canBeRemindedForUser"
import { RemindButton } from "../RemindButton"
import { ItemCard } from "../ItemCard"
import Link from "next/link"
import { CategoryList } from "../CategoryList"
import { ItemList } from "@/components/ItemList"
import { ShareWishlist } from "@/components/ShareWishlist"
import { EditWishlist } from "@/components/EditWishlist"
import { getGroupOptionsForUser } from "@/lib/groups/getGroupOptionsForUser"
import { UnfollowWishlist } from "@/components/UnfollowWishlist"
import { StopManagingWishlist } from "@/components/StopManagingWishlist"
import { getManagerOptionsForUser } from "@/lib/users/getManagerOptionsForUser"
import { getFirstName } from "@/lib/users/getFirstName"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { groupByCategory } from "@/lib/wishlistCategories/groupByCategory"
import { getClosedCategories } from "@/lib/wishlistCategories/getClosedCategories"

interface Props {
  id: string
  groupId?: string
}

export const Wishlist = async ({ id, groupId }: Props) => {
  const wishlist = await getWishlistById(id)
  const group = groupId ? await getGroupById(groupId) : null
  const closedCategories = await getClosedCategories()
  const t = await getTranslations("GroupWishlist")
  const tEdit = await getTranslations("EditWishlist")
  const format = await getFormatter()

  if (!wishlist) {
    notFound()
  }

  const canBeReminded = await canBeRemindedForUser(wishlist.user.id)
  const ownGroups = wishlist.isOwnList ? await getGroupOptionsForUser() : []
  const managerOptions =
    wishlist.isOwnList && !wishlist.isManager
      ? await getManagerOptionsForUser(wishlist.id)
      : []
  const categoryTitles = wishlist.categories.map(({ title }) => title)

  const renderItem = (item: (typeof wishlist.wishlistItem)[number]) => {
    if (wishlist.isOwnList) {
      return (
        <YourItemCard key={item.id} item={item} categories={categoryTitles} />
      )
    }

    return <ItemCard key={item.id} item={item} />
  }

  const toSortable = (item: (typeof wishlist.wishlistItem)[number]) => ({
    id: item.id,
    name: item.title,
    node: renderItem(item),
  })

  const { uncategorized, categories } = groupByCategory(
    wishlist.wishlistItem,
    wishlist.categories
  )

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
          <WishlistTitle
            wishlist={wishlist}
            showGroups={wishlist.isOwnList && !group}
          />{" "}
          {group && (
            <small className="text-base text-foreground">
              {t.rich("inGroup", {
                group: group.title,
                link: chunks => (
                  <Link
                    className="underline underline-offset-2"
                    href={`/group/${group.id}`}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </small>
          )}
        </ListTitle>

        {wishlist.description && (
          <small className="italic text-sm">{wishlist.description}</small>
        )}

        {wishlist.managedWith.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("hint.together", {
              names: format.list(wishlist.managedWith.map(getFirstName)),
            })}
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {wishlist.isOwnList
            ? t("hint.own")
            : t("hint.other", { name: getWishlistName(wishlist) })}
        </p>

        {wishlist.isOwnList && (
          <EditWishlist
            wishlist={{
              id: wishlist.id,
              title: wishlist.title,
              description: wishlist.description,
              theme: wishlist.theme,
              groups: wishlist.groups
                .filter(({ id }) => ownGroups.some(group => group.id === id))
                .map(({ id }) => ({ id })),
              managers: wishlist.managers.map(({ id }) => ({ id })),
              isManager: wishlist.isManager,
            }}
            groups={ownGroups}
            managers={managerOptions}
            label={tEdit("pageButton")}
            className="mt-3"
          />
        )}
      </div>

      <ItemList
        id={`items-${wishlist.id}`}
        wishlistId={wishlist.id}
        items={uncategorized.map(toSortable)}
        sortable={wishlist.isOwnList}
      />

      {categories.length > 0 && (
        <CategoryList
          wishlistId={wishlist.id}
          categories={categories.map(({ id, title, items }) => ({
            id,
            title,
            count: items.length,
            items: (
              <ItemList
                id={`items-${id}`}
                wishlistId={wishlist.id}
                items={items.map(toSortable)}
                sortable={wishlist.isOwnList}
              />
            ),
          }))}
          closedCategories={closedCategories}
          sortable={wishlist.isOwnList}
        />
      )}

      {wishlist.wishlistItem.length === 0 && (
        <EmptyState title={t("empty.title")}>{t("empty.text")}</EmptyState>
      )}

      {(wishlist.isOwnList || canBeReminded || wishlist.isFollowing) && (
        <Separator className="my-3" />
      )}

      {wishlist.isOwnList && (
        <>
          <NewItem id={wishlist.id} categories={categoryTitles} />
          <ShareWishlist
            wishlistId={wishlist.id}
            name={getWishlistName(wishlist)}
          />
        </>
      )}

      {wishlist.isManager && <StopManagingWishlist wishlistId={wishlist.id} />}

      {canBeReminded && !wishlist.isOwnList && (
        <RemindButton userId={wishlist.user.id} />
      )}

      {wishlist.isFollowing && <UnfollowWishlist wishlistId={wishlist.id} />}
    </List>
  )
}
