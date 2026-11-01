import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { WishlistTitle } from "@/components/WishlistTitle"
import { BackLink } from "@/components/BackLink"
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

interface Props {
  id: string
  groupId?: string
}

export const Wishlist = async ({ id, groupId }: Props) => {
  const wishlist = await getWishlistById(id)
  const group = groupId ? await getGroupById(groupId) : null
  const openCategories = await getOpenCategories()
  const t = await getTranslations("GroupWishlist")
  const tEdit = await getTranslations("EditWishlist")
  const tInterests = await getTranslations("Interests")
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
  const name = getWishlistName(wishlist)
  const isOwnWishlist =
    wishlist.isOwnList && !wishlist.isManager && !wishlist.title
  const hasItems = wishlist.wishlistItem.length > 0
  const onlyInterests = !hasItems && wishlist.interests.length > 0
  const showRemind = canBeReminded && !wishlist.isOwnList && !onlyInterests

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
      {group && <BackLink href={`/group/${group.id}`} label={group.title} />}
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
          />
        </ListTitle>

        {wishlist.managedWith.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {t("hint.together", {
              names: format.list(wishlist.managedWith.map(getFirstName)),
            })}
          </p>
        )}

        <p className="mt-2 text-sm text-muted-foreground">
          {wishlist.isOwnList ? t("hint.own") : t("hint.other", { name })}
        </p>

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
            groups={ownGroups}
            managers={managerOptions}
            label={tEdit("pageButton")}
            className="mt-3"
          />
        )}
      </div>

      {(wishlist.isOwnList || wishlist.interests.length > 0) && (
        <Interests
          wishlistId={wishlist.id}
          title={
            isOwnWishlist
              ? tInterests("title.own")
              : tInterests("title.other", { name })
          }
          interests={wishlist.interests}
          hint={
            wishlist.isOwnList && wishlist.interests.length === 0
              ? isOwnWishlist
                ? tInterests("hint.own")
                : tInterests("hint.managed", { name })
              : undefined
          }
          editable={wishlist.isOwnList}
        />
      )}

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

      {!hasItems &&
        (wishlist.isOwnList ? (
          onlyInterests ? (
            <EmptyState title={t("empty.interests.title")}>
              {isOwnWishlist
                ? t("empty.interests.own")
                : t("empty.interests.managed", { name })}
            </EmptyState>
          ) : wishlist.title ? (
            <EmptyState title={t("empty.managed.title")}>
              {t("empty.managed.text", { name })}
            </EmptyState>
          ) : (
            <EmptyState title={t("empty.own.title")}>
              {t("empty.own.text")}
            </EmptyState>
          )
        ) : onlyInterests ? (
          <EmptyState title={t("empty.other.interests.title", { name })}>
            {t("empty.other.interests.text", { name })}
          </EmptyState>
        ) : (
          <EmptyState title={t("empty.other.title", { name })}>
            {canBeReminded
              ? t("empty.other.remind", {
                  name: getFirstName(wishlist.user),
                })
              : t("empty.other.later")}
          </EmptyState>
        ))}

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

      {showRemind && <RemindButton userId={wishlist.user.id} />}

      {wishlist.isFollowing && <UnfollowWishlist wishlistId={wishlist.id} />}
    </List>
  )
}
