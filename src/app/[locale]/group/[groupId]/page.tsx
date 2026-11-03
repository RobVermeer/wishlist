import { BackLink } from "@/components/BackLink"
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
import { getGroupInvite } from "@/lib/groups/getGroupInvite"
import { GroupInvite } from "@/components/GroupInvite"
import { openGraphImage } from "@/lib/openGraph"
import { Metadata } from "next"
import { getFormatter, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getSession } from "@/lib/getSession"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { getFirstName } from "@/lib/users/getFirstName"
import { getLotForUser } from "@/lib/draws/getLotForUser"
import { getDrawForCreator } from "@/lib/draws/getDrawForCreator"
import { DrawSummary } from "@/components/DrawSummary"
import { DrawLot } from "@/components/DrawLot"
import { DrawLots } from "@/components/DrawLots"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId } = await params
  const group = await getGroupInvite(groupId)

  if (!group) return {}

  const t = await getTranslations("GroupInvite.preview")

  // The link of a group is the invitation: a preview in WhatsApp and the
  // like, but no search results, the layout keeps this page out of the index.
  return {
    title: `${group.title} - Niet Weer Sokken`,
    openGraph: {
      type: "website",
      siteName: "Niet Weer Sokken",
      locale: "nl_NL",
      title: t("title", { group: group.title }),
      description: t("text"),
      images: [openGraphImage],
    },
  }
}

interface Props {
  params: Promise<{ groupId: string }>
}

export default async function GroupPage({ params }: Props) {
  const { groupId } = await params
  const session = await getSession()

  if (!session) {
    const invite = await getGroupInvite(groupId)

    if (!invite) notFound()

    return <GroupInvite group={invite} />
  }

  const group = await getGroupById(groupId)
  const t = await getTranslations("Group")
  const tBackLink = await getTranslations("BackLink")
  const tCommon = await getTranslations("Common")
  const format = await getFormatter()

  if (!group) {
    notFound()
  }

  const backLink = <BackLink href="/" label={tBackLink("overview")} />

  if (!group.subscribed) {
    return (
      <>
        {backLink}
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
      name: wishlist.title || tCommon("myList"),
      details: t("chooseWishlist.details", {
        wishes: wishlist._count.wishlistItem,
        groups: wishlist.groups.length,
        names: format.list(wishlist.groups.map(({ title }) => title)),
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

  const drawLots = (
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
  )

  const chooseButton = (
    <Button>
      <ListChecks size="16" className="mr-2" /> {t("chooseWishlist.button")}
    </Button>
  )

  return (
    <List>
      {backLink}
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

      {lot && <DrawLot lot={lot} />}

      {groupIsEmpty && (
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

      {isCreator && draw && (
        <DrawSummary participants={draw}>{drawLots}</DrawSummary>
      )}

      {isCreator && !draw && group.members.length > 1 && (
        <section
          aria-labelledby="draw-title"
          className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4"
        >
          <div className="grid gap-0.5">
            <h3 id="draw-title" className="flex items-center gap-2 font-medium">
              <Dices aria-hidden size="18" className="text-primary" />
              {tDraw("manage.title")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tDraw("manage.text")}
            </p>
          </div>
          {drawLots}
        </section>
      )}

      <Separator className="my-3" />

      <AddWishlistToGroup
        group={groupInfo}
        own={wishlistNames(ownToChoose).map(option => ({
          ...option,
          replaces:
            ownInGroup.length === 1
              ? t("addWishlist.replaces")
              : ownInGroup.length > 1
                ? t("addWishlist.replacesMany")
                : undefined,
        }))}
        ownInGroup={ownInGroup.length > 0}
        forSomeoneElse={wishlistNames(forSomeoneElseToAdd)}
        groups={groupOptions}
        managers={managerOptions}
        variant={
          !groupIsEmpty && ownInGroup.length === 0 ? "default" : "outline"
        }
      />
      {!groupIsEmpty && (
        <ShareButton
          title={group.title}
          variant={
            group.members.length === 1 && ownInGroup.length === 1
              ? "default"
              : "outline"
          }
        />
      )}
    </List>
  )
}
