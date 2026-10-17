import { EmptyState } from "@/components/EmptyState"
import { FollowGroup } from "@/components/FollowGroup"
import { List } from "@/components/List"
import { ShareButton } from "@/components/ShareButton"
import { WishlistCard } from "@/components/WishlistCard"
import { Wishlist } from "@/components/Wishlist"
import { EditGroup } from "@/components/EditGroup"
import { LeaveGroup } from "@/components/LeaveGroup"
import { ChooseWishlistForGroup } from "@/components/ChooseWishlistForGroup"
import { NewWishlist } from "@/components/NewWishlist"
import { Button } from "@/components/ui/button"
import { ListChecks, Plus, UserPlus } from "lucide-react"
import { getGroupOptionsForUser } from "@/lib/groups/getGroupOptionsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/nextAuth"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params
  const group = await getGroupById(groupId)

  if (!group) return {}

  return {
    title: `${group.title} - Wishlist`,
  }
}

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/group/${groupId}`)}`)
  }

  const group = await getGroupById(groupId)
  const t = await getTranslations("Group")
  const tCommon = await getTranslations("Common")

  if (!group) {
    notFound()
  }

  if (!group.subscribed) {
    return (
      <>
        <EmptyState title={t("noFollow.title")}>
          {t("noFollow.text")}
        </EmptyState>
        <FollowGroup groupId={group.id} text={t("follow")} />
      </>
    )
  }

  const groupOptions = await getGroupOptionsForUser()
  const ownWishlists = (await getWishlistsForUser()).filter(
    wishlist => !wishlist.title
  )
  const ownInGroup = ownWishlists.filter(wishlist =>
    wishlist.groups.some(({ id }) => id === group.id)
  )
  const ownToChoose = ownWishlists.filter(
    wishlist => !ownInGroup.includes(wishlist)
  )
  const wishlistNames = (wishlists: typeof ownWishlists) =>
    wishlists.map(wishlist => ({
      id: wishlist.id,
      name: wishlist.description || tCommon("myList"),
      details: t("chooseWishlist.wishes", {
        count: wishlist.wishlistItem.length,
      }),
    }))
  const [onlyWishlist] = group.wishlist
  const showOnlyWishlist =
    group.wishlist.length === 1 && !onlyWishlist.isOwnList

  const chooseButton = (
    <Button>
      <ListChecks size="16" className="mr-2" /> {t("chooseWishlist.button")}
    </Button>
  )

  return (
    <List>
      <div
        className="relative flex h-44 flex-col justify-between overflow-hidden rounded-3xl bg-cover bg-center p-5 text-white shadow-md"
        style={{
          backgroundImage: `url('/theme/${group.theme || "background"}.webp')`,
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10" />
        <span className="absolute right-10 top-0 h-full w-3 bg-gold/80" />
        <div className="relative flex justify-end">
          {group.createdBy.id === session.user.id ? (
            <EditGroup group={group} className="shrink-0 text-foreground" />
          ) : (
            <LeaveGroup group={group} className="shrink-0 text-foreground" />
          )}
        </div>
        <div className="relative">
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            {group.title}
          </h2>
          <p className="text-sm text-white/80">
            {t("members", { count: group.members.length })}
          </p>
        </div>
      </div>

      {ownInGroup.length === 0 && (
        <section className="grid gap-3 rounded-md border p-4">
          <EmptyState title={t("missing.title")}>
            {t("missing.text", { group: group.title })}
          </EmptyState>
          <div className="flex flex-wrap gap-2">
            {ownToChoose.length > 0 && (
              <ChooseWishlistForGroup
                group={group}
                wishlists={wishlistNames(ownToChoose)}
                trigger={chooseButton}
              />
            )}
            <NewWishlist
              groups={groupOptions}
              defaultGroupIds={[group.id]}
              trigger={
                <Button variant="outline">
                  <Plus size="16" className="mr-2" /> {t("newWishlist")}
                </Button>
              }
            />
          </div>
        </section>
      )}

      {ownInGroup.length > 1 && (
        <section className="grid gap-3 rounded-md border p-4">
          <EmptyState
            title={t("duplicates.title", { count: ownInGroup.length })}
          >
            {t("duplicates.text")}
          </EmptyState>
          <ChooseWishlistForGroup
            group={group}
            wishlists={wishlistNames([...ownInGroup, ...ownToChoose])}
            trigger={chooseButton}
          />
        </section>
      )}

      {showOnlyWishlist ? (
        <Wishlist id={onlyWishlist.id} />
      ) : (
        group.wishlist.map(wishlist => (
          <WishlistCard key={wishlist.id} wishlist={wishlist} group={group} />
        ))
      )}

      {group.wishlist.length === 0 && <EmptyState title={t("empty.title")} />}

      <Separator className="my-3" />

      {ownInGroup.length === 1 && ownToChoose.length > 0 && (
        <ChooseWishlistForGroup
          group={group}
          wishlists={wishlistNames(ownToChoose)}
          trigger={
            <Button variant="outline">
              <ListChecks size="16" className="mr-2" />{" "}
              {t("chooseWishlist.change")}
            </Button>
          }
        />
      )}
      <NewWishlist
        groups={groupOptions}
        defaultGroupIds={[group.id]}
        defaultOwnList={false}
        trigger={
          <Button variant="outline">
            <UserPlus size="16" className="mr-2" /> {t("forSomeoneElse")}
          </Button>
        }
      />
      <ShareButton title={group.title} />
    </List>
  )
}
