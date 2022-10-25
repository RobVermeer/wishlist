import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import { withBaseProps } from "~/utils/withBaseProps"

function GroupPage() {
  const { query, push } = useRouter()
  const { data = {} } = useQuery(["groups", query.id], () =>
    fetch(`/api/groups/${query.id}`).then((res) => res.json())
  )
  const { data: group } = data

  if (!group) return <div></div>

  if (group.wishlist.length === 0)
    return (
      <EmptyState
        title="😵‍💫 Er zijn nog geen lijstjes! 😵‍💫"
        text="Maak als eerste een lijstje aan in je profiel! 🤑"
        buttons={
          <>
            <Button onClick={() => push("/profile")}>Bekijk je profiel</Button>
            <Button variant="primary" onClick={() => push("/profile")}>
              Ga direct naar je wensenlijstjes
            </Button>
          </>
        }
      />
    )

  return (
    <div>
      <PageTitle>{group.title}</PageTitle>

      <Cards>
        {group.wishlist.map((wishlist, index) => (
          <Card
            key={wishlist.id}
            index={index}
            title={wishlist.title || wishlist.user.name}
            link={`/group/${query.id}/${wishlist.id}`}
          />
        ))}
      </Cards>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Group" },
  }))
}

export default GroupPage
