import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { Cards } from "~/components/Card"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import { WishlistItem } from "~/components/WishlistItem"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function WishlistPage({ session }) {
  const { userId } = session
  const { query, push } = useRouter()
  const { id, wishlistId } = query
  const { data = {} } = useQuery(["wishlist", wishlistId], () =>
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
    <div className={styles.container}>
      <PageTitle>{wishlist.title || wishlist.user.name}</PageTitle>
      <Cards>
        {wishlist.wishlistItem.map((item, index) => (
          <WishlistItem
            key={item.id}
            wishlistId={wishlistId}
            item={item}
            index={index}
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
