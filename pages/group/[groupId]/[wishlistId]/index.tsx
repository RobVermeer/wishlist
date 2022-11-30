import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { WishlistTitle } from "~/components/CardWishlist"
import { Checkbox } from "~/components/Checkbox"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import { getGroupById } from "~/lib/groups/getGroupById"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { WishlistItemProperties } from "~/lib/wishlistItems/publicProperties"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { withBaseProps } from "~/utils/withBaseProps"

interface WishlistPageProps {
  session: Session
  initialWishlistData: WishlistProperties[]
  initialGroupData: GroupProperties[]
}

function WishlistPage({
  session,
  initialWishlistData,
  initialGroupData,
}: WishlistPageProps) {
  const { user } = session
  const { id: userId } = user
  const { query, push } = useRouter()
  const { groupId, wishlistId } = query
  // @ts-ignore
  const { data: wishlistData = {} } = useQuery(
    ["wishlists", wishlistId],
    () => fetch(`/api/wishlists/${wishlistId}`).then((res) => res.json()),
    { initialData: initialWishlistData }
  )
  const { data: wishlist } = wishlistData
  // @ts-ignore
  const { data: groupData = {} } = useQuery(
    ["groups", groupId],
    () => fetch(`/api/groups/${groupId}`).then((res) => res.json()),
    { initialData: initialGroupData }
  )
  const { data: group } = groupData

  if (!wishlist) return <div></div>

  if (wishlist.user.id === userId) {
    return (
      <EmptyState
        title="🥸 Dit is je eigen lijstje 🥸"
        text="Je mag natuurlijk niet zien wat anderen al hebben gekocht, maar als je je lijstje wilt aanpassen, dan kan dat op je profiel! 🤩"
        buttons={
          <>
            <Button onClick={() => push(`/profile`)}>Bekijk je profiel</Button>
            <Button
              variant="primary"
              onClick={() => push(`/profile/wishlists/${wishlistId}`)}
            >
              Ga direct naar je lijstje
            </Button>
          </>
        }
      />
    )
  }

  if (wishlist.wishlistItem.length == 0) {
    return (
      <EmptyState
        title="🫣 Dit lijstje is nog helemaal leeg 🫣"
        text="Wel zo goedkoop, alleen misschien moeten we er toch maar wat van gaan zeggen! 👮"
        buttons={
          <>
            <Button onClick={() => push(`/group/${groupId}`)}>
              Terug naar de groep
            </Button>
            <Button disabled>Stuur een notificatie</Button>
          </>
        }
      />
    )
  }

  return (
    <div>
      <PageTitle>
        <WishlistTitle wishlist={wishlist} />{" "}
        <small>
          In <Link href={`/group/${groupId}`}>{group.title}</Link>
        </small>
      </PageTitle>
      <Cards>
        {wishlist.wishlistItem.map(
          (item: WishlistItemProperties, index: number) => (
            <Card
              key={item.id}
              title={item.title}
              url={item.url}
              index={index}
              checked={Boolean(item.boughtBy)}
              adornment={<Checkbox item={item} wishlistId={wishlist.id} />}
            />
          )
        )}
      </Cards>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { query } = context
    const { wishlistId, groupId } = query

    if (
      !wishlistId ||
      Array.isArray(wishlistId) ||
      !groupId ||
      Array.isArray(groupId)
    ) {
      return {
        notFound: true,
      }
    }

    const wishlistData = await getWishlistById(wishlistId)
    const groupData = await getGroupById(groupId)

    if (!wishlistData || !groupData) {
      return {
        notFound: true,
      }
    }

    return {
      props: {
        title:
          wishlistData.title ||
          wishlistData.user.firstName ||
          wishlistData?.user.name?.split(" ")[0],
        initialWishlistData: { data: wishlistData },
        initialGroupData: { data: groupData },
      },
    }
  })
}

export default WishlistPage
