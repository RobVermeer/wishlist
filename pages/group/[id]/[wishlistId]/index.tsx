import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import { WishlistItem } from "~/components/WishlistItem"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function WishlistPage({ session }) {
  const { userId } = session
  const { query } = useRouter()
  const { data = {} } = useQuery(["wishlist", query.wishlistId], () =>
    fetch(`/api/wishlists/${query.wishlistId}`).then((res) => res.json())
  )
  const { data: wishlist } = data

  if (!wishlist) return <div></div>

  if (wishlist.user.id === userId) {
    return (
      <div>
        This is your own list, please go to{" "}
        <Link href="/profile">your profile</Link> to change your list
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <PageTitle>{wishlist.title || wishlist.user.name}</PageTitle>
      <Cards>
        {wishlist.wishlistItem.map((item, index) => (
          <WishlistItem
            key={item.id}
            wishlistId={query.wishlistId}
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
