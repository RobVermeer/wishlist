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
      <PageTitle>Profiel</PageTitle>

      <div className={styles.wishlists}>
        <h3>Je verlanglijstjes</h3>
        <Cards>
          {wishlists.map((wishlist, index) => (
            <Link key={wishlist.id} href={`/profile/wishlists/${wishlist.id}`}>
              <a style={{ "--_index": index }}>
                {wishlist.title || "My wishlist"}{" "}
                <small>
                  {wishlist.groups.map(({ title }) => title).join(", ")}
                </small>
              </a>
            </Link>
          ))}
        </Cards>
        <Link href="/profile/wishlists">
          <a>Bewerk verlanglijstjes</a>
        </Link>
      </div>

      <div className={styles.groups}>
        <h3>Groepen die je volgt</h3>
        <Cards>
          {groups.map((group, index) => (
            <Link key={group.id} href={`/group/${group.id}`}>
              <a style={{ "--_index": index }}>
                {group.title} <small>({group.wishlist.length})</small>
              </a>
            </Link>
          ))}
        </Cards>
        <Link href="/profile/groups">
          <a>Bewerk groepen</a>
        </Link>
      </div>

      <button className={styles.signoutButton}
        onClick={async () => {
          await signOut({ redirect: false, callbackUrl: "/" })
          await push("/")
        }}
      >
        Uitloggen
      </button>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({ props: { title: "Profile" } }))
}

export default ProfilePage
