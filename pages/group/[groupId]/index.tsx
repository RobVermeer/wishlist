import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { Cards } from "~/components/Cards"
import { CardWishlist } from "~/components/CardWishlist"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import { getGroupById } from "~/lib/groups/getGroupById"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { withBaseProps } from "~/utils/withBaseProps"

interface GroupPageProps {
  session: Session
  initialData: GroupProperties[]
}

function GroupPage({ session, initialData }: GroupPageProps) {
  const queryClient = useQueryClient()
  const { query, push } = useRouter()
  // @ts-ignore
  const { data = {} } = useQuery(
    ["groups", query.groupId],
    () => fetch(`/api/groups/${query.groupId}`).then((res) => res.json()),
    { initialData }
  )
  const { data: group } = data
  const subscribed = group.members.some(
    ({ id }: { id: string }) => id === session.userId
  )

  const subscribe = useMutation(
    () => {
      return fetch(`/api/user/groups/${group.id}/subscribe`, {
        method: "put",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
      },
    }
  )

  if (!group) return <div></div>

  if (!subscribed) {
    return (
      <EmptyState
        title="😵 Je volgt deze groep nog niet 😵"
        text="Volg de groep snel om alle lijstjes te kunnen zien! 😇"
        buttons={
          <>
            <Button variant="primary" onClick={() => subscribe.mutate()}>
              Volg de groep
            </Button>
          </>
        }
      />
    )
  }

  if (group.wishlist.length === 0) {
    return (
      <EmptyState
        title="😵‍💫 Er zijn nog geen lijstjes! 😵‍💫"
        text="Maak als eerste een lijstje aan in je profiel! 🤑"
        buttons={
          <>
            <Button onClick={() => push("/profile")}>Bekijk je profiel</Button>
            <Button variant="primary" onClick={() => push("/profile")}>
              Ga direct naar je verlanglijstjes
            </Button>
          </>
        }
      />
    )
  }

  return (
    <div>
      <PageTitle>{group.title}</PageTitle>

      <Cards>
        {group.wishlist.map((wishlist: WishlistProperties, index: number) => (
          <CardWishlist
            key={wishlist.id}
            index={index}
            wishlist={wishlist}
            groupId={group.id}
          />
        ))}
      </Cards>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { query } = context
    const data = await getGroupById(query.groupId as string)

    if (!data) {
      return {
        notFound: true,
      }
    }

    return {
      props: { title: "Group", initialData: { data } },
    }
  })
}

export default GroupPage
