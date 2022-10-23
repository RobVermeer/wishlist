import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function WishlistPage({ session }) {
  const { userId } = session
  const { query } = useRouter()
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["wishlist", query.wishlistId], () =>
    fetch(`/api/wishlists/${query.wishlistId}`).then((res) => res.json())
  )
  const { data: wishlist } = data

  const update = useMutation(
    (id) => {
      return fetch(`/api/wishlists/${query.wishlistId}/item/${id}/check`, {
        method: "put",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", query.wishlistId])
      },
    }
  )

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
        {wishlist.wishlistItem.map((item) => (
          <div key={item.id}>
            {item.title}{" "}
            <input
              type="checkbox"
              checked={Boolean(item.boughtBy)}
              onChange={() => {
                update.mutate(item.id)
              }}
            />
          </div>
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
