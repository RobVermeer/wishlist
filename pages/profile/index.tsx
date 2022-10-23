import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { CSSProperties, useState } from "react"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfilePage({ session }) {
  const [activeTab, setActiveTab] = useState("wishlists")
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

      <div className={styles.tabs}>
        <nav>
          <button
            className={`${activeTab === "wishlists" ? styles.current : ""}`}
            onClick={() => setActiveTab("wishlists")}
          >
            Je verlanglijstjes
          </button>
          <button
            className={`${activeTab === "groups" ? styles.current : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Je groepen
          </button>
          <button
            onClick={async () => {
              await signOut({ redirect: false, callbackUrl: "/" })
              await push("/")
            }}
          >
            Uitloggen
          </button>
        </nav>

        <div
          className={`${styles.tab} ${
            activeTab === "wishlists" ? styles.active : ""
          }`}
        >
          <Cards>
            {wishlists.map((wishlist, index) => (
              <Link
                key={wishlist.id}
                href={`/profile/wishlists/${wishlist.id}`}
              >
                <a style={{ "--_index": index } as CSSProperties}>
                  {wishlist.title || "My wishlist"}{" "}
                  <small>
                    in groep{wishlist.groups.length > 1 && "en"}:{" "}
                    {wishlist.groups
                      .map(({ title }) => title)
                      .join(", ")
                      .replace(/,([^,]+)$/i, " & $1")}
                  </small>
                </a>
              </Link>
            ))}
          </Cards>
          <Link href="/profile/wishlists">
            <a className={styles.manage}>Bewerk verlanglijstjes</a>
          </Link>
        </div>

        <div
          className={`${styles.tab} ${
            activeTab === "groups" ? styles.active : ""
          }`}
        >
          <Cards>
            {groups.map((group, index) => (
              <Link key={group.id} href={`/group/${group.id}`}>
                <a style={{ "--_index": index } as CSSProperties}>
                  {group.title} <small>({group.wishlist.length})</small>
                </a>
              </Link>
            ))}
          </Cards>
          <Link href="/profile/groups">
            <a className={styles.manage}>Bewerk groepen</a>
          </Link>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({ props: { title: "Profile" } }))
}

export default ProfilePage
