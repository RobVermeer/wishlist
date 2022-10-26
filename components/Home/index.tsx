import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import { EmptyState } from "~/components/EmptyState"
import { Button } from "~/components/Button"
import { CardGroup } from "~/components/CardGroup"
import { CardWishlist } from "~/components/CardWishlist"

export const Home = ({ userId, initialGroups, initialWishlists }) => {
  const { push } = useRouter()
  const { data: groupsData = {} } = useQuery(
    ["groups", userId],
    () => fetch("/api/user/groups").then((res) => res.json()),
    { initialData: initialGroups }
  )
  const { data: groups } = groupsData

  const { data: wishlistsData = {} } = useQuery(
    ["wishlists", userId],
    () => fetch("/api/user/wishlists").then((res) => res.json()),
    { initialData: initialWishlists }
  )
  const { data: wishlists } = wishlistsData

  if (!groups || !wishlists) return <div></div>

  if (groups.length === 0) {
    return (
      <EmptyState
        title="🥺 Je volgt nog geen enkele groep 🥺"
        text="Om te zien wat anderen willen en om je eigen wensenlijstje te kunnen
          toevoegen moet je als eerste een groep volgen. Ga naar je profiel om
          te beginnen! 🚀"
        buttons={
          <>
            <Button onClick={() => push("/profile")}>Bekijk je profiel</Button>
            <Button variant="primary" onClick={() => push("/profile?groups")}>
              Ga direct naar groepen
            </Button>
          </>
        }
      />
    )
  }

  return (
    <div>
      <PageTitle>Groepen die je volgt</PageTitle>
      <Cards>
        {groups.map((group, index) => (
          <CardGroup key={group.id} index={index} group={group} />
        ))}
      </Cards>
      <br />
      <br />
      <PageTitle>Ga direct naar je eigen lijstjes</PageTitle>
      <Cards>
        {wishlists.map((wishlist, index) => (
          <CardWishlist key={wishlist.id} wishlist={wishlist} index={index} />
        ))}
      </Cards>
    </div>
  )
}
