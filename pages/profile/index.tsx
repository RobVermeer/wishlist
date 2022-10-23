import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfilePage({ session }) {
  const { push } = useRouter()
  const { data: groupData = {} } = useQuery(["groups", session.userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )

  const { data: groups = [] } = groupData
  const { data: wishlistData = {} } = useQuery(
    ["wishlists", session.userId],
    () => fetch("/api/user/wishlists").then((res) => res.json())
  )
  const { data: wishlists = [] } = wishlistData

  return (
    <div className={styles.container}>
      <PageTitle>Profile</PageTitle>
      <h3>Your wishlists</h3>
      <Cards>
        {wishlists.map((wishlist) => (
          <Link key={wishlist.id} href={`/profile/wishlists/${wishlist.id}`}>
            <a>
              {wishlist.title || "My wishlist"}{" "}
              <small>
                {wishlist.groups.map(({ title }) => title).join(", ")}
              </small>
            </a>
          </Link>
        ))}
      </Cards>
      <Link href="/profile/wishlists">
        <a>Manage your wishlists</a>
      </Link>

      <h3>Groups you follow</h3>
      <Cards>
        {groups.map((group) => (
          <Link key={group.id} href={`/group/${group.id}`}>
            <a>
              {group.title} <small>({group.wishlist.length})</small>
            </a>
          </Link>
        ))}
      </Cards>
      <Link href="/profile/groups">
        <a>Manage groups you follow</a>
      </Link>

      <button
        onClick={async () => {
          await signOut({ redirect: false, callbackUrl: "/" })
          await push("/")
        }}
      >
        Sign out
      </button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({ props: { title: "Profile" } }))
}

export default ProfilePage
