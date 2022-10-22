import { useQuery } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"

function ProfilePage() {
  const { push } = useRouter()
  const { data: groupData = {} } = useQuery(["groups"], () =>
    fetch("/api/groups").then((res) => res.json())
  )
  const { data: groups = [] } = groupData
  const { data: wishlistData = {} } = useQuery(["wishlists"], () =>
    fetch("/api/wishlists").then((res) => res.json())
  )
  const { data: wishlists = [] } = wishlistData

  return (
    <div className={styles.container}>
      <PageTitle>Profile</PageTitle>
      <h3>Your wishlists</h3>
      <Cards>
        {wishlists.map((wishlist) => (
          <Link key={wishlist.id} href={`/wishlist/${wishlist.id}`}>
            <a>{wishlist.title}</a>
          </Link>
        ))}
      </Cards>
      <Link href="/profile/wishlists">
        <a>Manage your wishlists</a>
      </Link>

      <h3>Groups you follow</h3>
      <Cards>
        {groups
          .filter(({ isSubscribed }) => isSubscribed)
          .map((group) => (
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

export default ProfilePage
