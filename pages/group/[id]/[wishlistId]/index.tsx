import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { Checkbox } from "~/components/Checkbox"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import { withBaseProps } from "~/utils/withBaseProps"

function WishlistPage({ session }) {
  const { userId } = session
  const { query, push } = useRouter()
  const { id, wishlistId } = query
  const { data = {} } = useQuery(["wishlists", wishlistId], () =>
    fetch(`/api/wishlists/${wishlistId}`).then((res) => res.json())
  )
  const { data: wishlist } = data

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
            <Button onClick={() => push(`/group/${id}`)}>
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
      <PageTitle>{wishlist.title || wishlist.user.name}</PageTitle>
      <Cards>
        {wishlist.wishlistItem.map((item, index) => (
          <Card
            key={item.id}
            title={item.title}
            url={item.url}
            index={index}
            checked={Boolean(item.boughtBy)}
            adornment={<Checkbox item={item} wishlistId={wishlist.id} />}
          />
        ))}
      </Cards>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Wishlist" },
  }))
}

export default WishlistPage
