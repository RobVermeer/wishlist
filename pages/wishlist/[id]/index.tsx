import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"

function WishlistPage() {
  const { query } = useRouter()
  const { data = {} } = useQuery(["wishlist", query.id], () =>
    fetch(`/api/wishlists/${query.id}`).then((res) => res.json())
  )
  const { data: wishlist } = data

  console.log(wishlist)

  if (!wishlist) return <div></div>

  return (
    <div className={styles.container}>
      <PageTitle>{wishlist.title}</PageTitle>
      <Cards>
        {wishlist.wishlistItem.map((wishlist) => (
          <div key={wishlist.id}>{wishlist.title}</div>
        ))}
      </Cards>
    </div>
  )
}

export default WishlistPage
