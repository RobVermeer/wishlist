import { EmptyState } from "@/components/EmptyState"
import { FollowGroup } from "@/components/FollowGroup"
import { List } from "@/components/List"
import { ShareButton } from "@/components/ShareButton"
import { WishlistCard } from "@/components/WishlistCard"
import { Wishlist } from "@/components/Wishlist"
import { EditGroup } from "@/components/EditGroup"
import { LeaveGroup } from "@/components/LeaveGroup"
import { AddWishlistToGroup } from "@/components/AddWishlistToGroup"
import { ChooseWishlistForGroup } from "@/components/ChooseWishlistForGroup"
import { NewWishlist } from "@/components/NewWishlist"
import { Button } from "@/components/ui/button"
import { Dices, ListChecks, Plus } from "lucide-react"
import { getGroupOptionsForUser } from "@/lib/groups/getGroupOptionsForUser"
import { groupBackground } from "@/lib/groups/themes"
import { getManagerOptionsForUser } from "@/lib/users/getManagerOptionsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { Separator } from "@/components/ui/separator"
import { getGroupById } from "@/lib/groups/getGroupById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { notFound, redirect } from "next/navigation"
import { authOptions } from "@/lib/nextAuth"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { getFirstName } from "@/lib/users/getFirstName"
import { getLotForUser } from "@/lib/draws/getLotForUser"
import { getDrawForCreator } from "@/lib/draws/getDrawForCreator"
import { DrawStatus } from "@/components/DrawStatus"
import { DrawLot } from "@/components/DrawLot"
import { DrawLots } from "@/components/DrawLots"

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
  const managerOptions = await getManagerOptionsForUser()
  const wishlists = await getWishlistsForUser()
  const ownWishlists = wishlists.filter(wishlist => !wishlist.title)
  const forSomeoneElseToAdd = wishlists.filter(
    wishlist =>
      wishlist.title && !wishlist.groups.some(({ id }) => id === group.id)
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
      name: wishlist.title || wishlist.description || tCommon("myList"),
      details: t("chooseWishlist.wishes", {
        count: wishlist.wishlistItem.length,
      }),
    }))
  const groupInfo = { id: group.id, title: group.title }
  const groupIsEmpty = group.wishlist.length === 0
  const isCreator = group.createdBy.id === session.user.id
  const lot = await getLotForUser(group.id)
  const draw = isCreator ? await getDrawForCreator(group.id) : null
  const tDraw = await getTranslations("Draw")
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
          backgroundImage: groupBackground(group.theme),
        }}
      >
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative flex justify-end">
          {isCreator ? (
            <EditGroup
              group={{ ...groupInfo, theme: group.theme }}
              members={group.members
                .filter(({ id }) => id !== group.createdBy.id)
                .map(member => ({ id: member.id, name: getFirstName(member) }))}
              wishlists={group.wishlist.map(wishlist => ({
                id: wishlist.id,
                name: getWishlistName(wishlist),
              }))}
              className="shrink-0 text-foreground"
            />
          ) : (
            <LeaveGroup
              group={{ id: group.id }}
              className="shrink-0 text-foreground"
            />
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

      {lot && <DrawLot groupId={group.id} lot={lot} />}

      {groupIsEmpty ? (
        <section
          aria-labelledby="group-start"
          className="grid gap-4 rounded-md border p-4"
        >
          <div className="grid gap-1">
            <h3 id="group-start" className="text-xl text-secondary-foreground">
              {t("empty.title")}
            </h3>
            <p className="text-muted-foreground">{t("empty.text")}</p>
          </div>
          <ol className="grid gap-4">
            <li className="grid gap-2">
              <span className="flex items-center gap-3 font-medium">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  1
                </span>
                {t("empty.steps.wishlist")}
              </span>
              <div className="flex flex-wrap gap-2 pl-10">
                {ownToChoose.length > 0 && (
                  <ChooseWishlistForGroup
                    group={groupInfo}
                    wishlists={wishlistNames(ownToChoose)}
                    trigger={chooseButton}
                  />
                )}
                <NewWishlist
                  groups={groupOptions}
                  managers={managerOptions}
                  defaultGroupIds={[group.id]}
                  trigger={
                    <Button
                      variant={ownToChoose.length > 0 ? "outline" : "default"}
                    >
                      <Plus size="16" className="mr-2" /> {t("newWishlist")}
                    </Button>
                  }
                />
              </div>
            </li>
            <li className="grid gap-2">
              <span className="flex items-center gap-3 font-medium">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  2
                </span>
                {t("empty.steps.invite")}
              </span>
              <div className="pl-10">
                <ShareButton title={group.title} variant="outline" />
              </div>
            </li>
          </ol>
        </section>
      ) : (
        ownInGroup.length === 0 && (
          <section className="grid gap-3 rounded-md border p-4">
            <EmptyState title={t("missing.title")}>
              {t("missing.text", { group: group.title })}
            </EmptyState>
            <div className="flex flex-wrap gap-2">
              {ownToChoose.length > 0 && (
                <ChooseWishlistForGroup
                  group={groupInfo}
                  wishlists={wishlistNames(ownToChoose)}
                  trigger={chooseButton}
                />
              )}
              <NewWishlist
                groups={groupOptions}
                managers={managerOptions}
                defaultGroupIds={[group.id]}
                trigger={
                  <Button
                    variant={ownToChoose.length > 0 ? "outline" : "default"}
                  >
                    <Plus size="16" className="mr-2" /> {t("newWishlist")}
                  </Button>
                }
              />
            </div>
          </section>
        )
      )}

      {ownInGroup.length > 1 && (
        <section className="grid gap-3 rounded-md border p-4">
          <EmptyState
            title={t("duplicates.title", { count: ownInGroup.length })}
          >
            {t("duplicates.text")}
          </EmptyState>
          <ChooseWishlistForGroup
            group={groupInfo}
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

      {isCreator && (draw || group.members.length > 1) && (
        <section
          aria-labelledby="draw-title"
          className={
            draw
              ? "grid gap-3 rounded-md border p-4"
              : "flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
          }
        >
          <div className="grid gap-0.5">
            <h3 id="draw-title" className="flex items-center gap-2 font-medium">
              <Dices aria-hidden size="18" className="text-primary" />
              {draw ? tDraw("manage.drawnTitle") : tDraw("manage.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {draw ? tDraw("manage.drawnText") : tDraw("manage.text")}
            </p>
          </div>
          {draw && <DrawStatus participants={draw} />}
          <DrawLots
            groupId={group.id}
            members={group.members.map(member => ({
              id: member.id,
              name: getFirstName(member) || tDraw("anonymous"),
            }))}
            previous={(draw ?? [])
              .filter(({ status }) => status === "invited")
              .map(({ id, name }) => ({ id, name }))}
            redraw={draw !== null}
          />
        </section>
      )}

      <Separator className="my-3" />

      <AddWishlistToGroup
        group={groupInfo}
        own={wishlistNames(ownToChoose).map(option => ({
          ...option,
          replaces:
            ownInGroup.length === 1
              ? t("addWishlist.replaces", {
                  name: wishlistNames(ownInGroup)[0].name,
                })
              : ownInGroup.length > 1
                ? t("addWishlist.replacesMany")
                : undefined,
        }))}
        ownInGroup={ownInGroup.length > 0}
        forSomeoneElse={wishlistNames(forSomeoneElseToAdd)}
        groups={groupOptions}
        managers={managerOptions}
      />
      {!groupIsEmpty && (
        <ShareButton
          title={group.title}
          variant={ownInGroup.length === 1 ? "default" : "outline"}
        />
      )}
    </List>
  )
}
