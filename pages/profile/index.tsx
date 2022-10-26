import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import { Button } from "~/components/Button"
import { CardGroup } from "~/components/CardGroup"
import { Cards } from "~/components/Cards"
import { CardWishlist } from "~/components/CardWishlist"
import { CreateGroup } from "~/components/CreateGroup"
import { CreateWishlist } from "~/components/CreateWishlist"
import { PageTitle } from "~/components/PageTitle"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfilePage({ session, initialTab, initialWishlists, initialGroups }) {
  const { push } = useRouter()
  const { userId } = session
  const [activeTab, setActiveTab] = useState(initialTab)
  const { data: groupData = {} } = useQuery(
    ["groups", userId],
    () => fetch("/api/user/groups").then((res) => res.json()),
    { initialData: initialGroups }
  )

  const { data: groups = [] } = groupData
  const { data: wishlistData = {} } = useQuery(
    ["wishlists", userId],
    () => fetch("/api/user/wishlists").then((res) => res.json()),
    { initialData: initialWishlists }
  )
  const { data: wishlists = [] } = wishlistData

  return (
    <div>
      <nav className={styles.profileTitle}>
        <PageTitle>Profiel</PageTitle>
        <Button
          variant="danger"
          onClick={async () => {
            await signOut({ redirect: false, callbackUrl: "/" })
            await push("/")
          }}
          small
        >
          Uitloggen
        </Button>
      </nav>

      <div className={styles.tabs}>
        <nav>
          <Button
            variant={`${activeTab === "wishlists" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("wishlists")}
          >
            Je verlanglijstjes
          </Button>
          <Button
            variant={`${activeTab === "groups" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("groups")}
          >
            Je groepen
          </Button>
        </nav>

        <div
          className={`${styles.tab} ${
            activeTab === "wishlists" ? styles.active : ""
          }`}
        >
          {wishlists.length === 0 && (
            <p>Je hebt nog geen lijstjes gemaakt, doe dit snel! 🥳</p>
          )}

          {wishlists.length > 0 && (
            <Cards>
              {wishlists.map((wishlist, index) => (
                <CardWishlist
                  key={wishlist.id}
                  wishlist={wishlist}
                  index={index}
                  showEdit
                  showGroups
                />
              ))}

              <CreateWishlist userId={userId} />
            </Cards>
          )}
        </div>

        <div
          className={`${styles.tab} ${
            activeTab === "groups" ? styles.active : ""
          }`}
        >
          {groups.length === 0 && (
            <p>Je volgt nog geen groepen, doe dit snel! 🧐</p>
          )}

          {groups.length > 0 && (
            <Cards>
              {groups.map((group, index) => (
                <CardGroup
                  key={group.id}
                  index={index}
                  group={group}
                  showEdit
                />
              ))}

              <CreateGroup />
            </Cards>
          )}
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session, query } = context
    const initialTab = "groups" in query ? "groups" : "wishlists"
    const wishlistsData = await getWishlistsForUser(session.userId)
    const groupsData = await getGroupsForUser(session.userId)

    return {
      props: {
        title: session.user.name,
        initialTab,
        initialWishlists: { data: wishlistsData },
        initialGroups: { data: groupsData },
      },
    }
  })
}

export default ProfilePage
