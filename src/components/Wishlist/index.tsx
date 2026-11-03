import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
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
import { canBeRemindedForWishlist } from "@/lib/reminders/canBeRemindedForWishlist"
import { RemindButton } from "../RemindButton"
import { ItemCard } from "../ItemCard"
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
import { getOpenCategories } from "@/lib/wishlistCategories/getOpenCategories"
import { Interests } from "@/components/Interests"
import { SortMode } from "@/components/SortMode"
import { ReactNode } from "react"

interface Props {
  id: string
  groupId?: string
  backLink?: ReactNode
}

export const Wishlist = async ({ id, groupId, backLink }: Props) => {
  const wishlist = await getWishlistById(id)
  const group = groupId ? await getGroupById(groupId) : null
  const openCategories = await getOpenCategories()
  const t = await getTranslations("GroupWishlist")
  const tCommon = await getTranslations("Common")
  const tInterests = await getTranslations("Interests")
  const format = await getFormatter()

  if (!wishlist) {
    notFound()
  }

  const canBeReminded = await canBeRemindedForWishlist(wishlist.id)
  const ownGroups = wishlist.isOwnList ? await getGroupOptionsForUser() : []
  const managerOptions =
    wishlist.isOwnList && !wishlist.isManager
      ? await getManagerOptionsForUser(wishlist.id)
      : []
  const categoryTitles = wishlist.categories.map(({ title }) => title)
  const name = getWishlistName(wishlist)
  const isOwnWishlist =
    wishlist.isOwnList && !wishlist.isManager && !wishlist.title
  const hasItems = wishlist.wishlistItem.length > 0
  const onlyInterests = !hasItems && wishlist.interests.length > 0
  const showRemind = canBeReminded && !wishlist.isOwnList && !onlyInterests

  const interestsTitle = isOwnWishlist
    ? tInterests("title.own")
    : tInterests("title.other", { name })

  const interestsNote = () => {
    if (!onlyInterests) return undefined
    if (isOwnWishlist) return tInterests("withoutWishes.own")
    return wishlist.isOwnList
      ? tInterests("withoutWishes.managed", { name })
      : tInterests("withoutWishes.other", { name })
  }

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
  const canSort =
    wishlist.isOwnList &&
    (uncategorized.length > 1 ||
      categories.length > 1 ||
      categories.some(({ items }) => items.length > 1))

  return (
    <List>
      {backLink}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {!wishlist.title && wishlist.user.image && (
            <Avatar className="size-12 shrink-0 ring-2 ring-white/70 shadow-sm">
              <AvatarImage src={wishlist.user.image} alt="" />
              <AvatarFallback>{getInitials(wishlist.user.name)}</AvatarFallback>
            </Avatar>
          )}
          <div className="grid min-w-0 gap-0.5">
            <h2 className="font-display text-3xl font-semibold tracking-tight">
              <WishlistTitle wishlist={wishlist} />
            </h2>

            {wishlist.isOwnList && !group && wishlist.groups.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {tCommon("inGroup", {
                  count: wishlist.groups.length,
                  groups: format.list(
                    wishlist.groups.map(({ title }) => title)
                  ),
                })}
              </p>
            )}

            {wishlist.managedWith.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {t("hint.together", {
                  names: format.list(wishlist.managedWith.map(getFirstName)),
                })}
              </p>
            )}
          </div>
        </div>
        {wishlist.isOwnList && (
          <EditWishlist
            wishlist={{
              id: wishlist.id,
              title: wishlist.title,
              theme: wishlist.theme,
              groups: wishlist.groups
                .filter(({ id }) => ownGroups.some(group => group.id === id))
                .map(({ id }) => ({ id })),
              managers: wishlist.managers.map(({ id }) => ({ id })),
              isManager: wishlist.isManager,
            }}
            interests={{
              title: interestsTitle,
              hint: isOwnWishlist
                ? tInterests("hint.own")
                : tInterests("hint.managed", { name }),
              items: wishlist.interests,
            }}
            groups={ownGroups}
            managers={managerOptions}
            className="shrink-0"
          />
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {wishlist.isOwnList ? t("hint.own") : t("hint.other", { name })}
      </p>

      {!hasItems &&
        !onlyInterests &&
        (wishlist.isOwnList ? (
          wishlist.title ? (
            <EmptyState title={t("empty.managed.title")}>
              {t("empty.managed.text", { name })}
            </EmptyState>
          ) : (
            <EmptyState title={t("empty.own.title")}>
              {t("empty.own.text")}
            </EmptyState>
          )
        ) : (
          <EmptyState title={t("empty.other.title", { name })}>
            {canBeReminded
              ? t(
                  wishlist.hasManagers
                    ? "empty.other.remindManaged"
                    : "empty.other.remind",
                  { name: getFirstName(wishlist.user) }
                )
              : t("empty.other.later")}
          </EmptyState>
        ))}

      {wishlist.interests.length > 0 && (
        <Interests
          title={interestsTitle}
          interests={wishlist.interests}
          note={interestsNote()}
        />
      )}

      <SortMode enabled={canSort} withCategories={categories.length > 1}>
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
            openCategories={openCategories}
            sortable={wishlist.isOwnList}
          />
        )}
      </SortMode>

      {(wishlist.isOwnList || showRemind || wishlist.isFollowing) && (
        <Separator className="my-3" />
      )}

      {wishlist.isOwnList && (
        <>
          <NewItem id={wishlist.id} categories={categoryTitles} />
          <ShareWishlist
            wishlistId={wishlist.id}
            name={name}
            forSomeoneElse={Boolean(wishlist.title)}
          />
        </>
      )}

      {wishlist.isManager && <StopManagingWishlist wishlistId={wishlist.id} />}

      {showRemind && <RemindButton wishlistId={wishlist.id} />}

      {wishlist.isFollowing && <UnfollowWishlist wishlistId={wishlist.id} />}
    </List>
  )
}
