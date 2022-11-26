import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
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
import { GroupProperties } from "~/lib/groups/publicProperties"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"
import { BoughtPresents } from "~/components/BoughtPresents"
import {
  BoughtWishlistItemProperties,
  getBoughtWishlistItemsForUser,
} from "~/lib/wishlistItems/getBoughtWishlistItemsForUser"

type Tab = "groups" | "wishlists" | "boughtPresents"

interface ProfilePage {
  session: Session
  initialTab: Tab
  initialWishlists: WishlistProperties[]
  initialGroups: GroupProperties[]
  boughtWishlistItems: BoughtWishlistItemProperties[]
}

function ProfilePage({
  session,
  initialTab,
  initialWishlists,
  initialGroups,
  boughtWishlistItems,
}: ProfilePage) {
  const { push } = useRouter()
  const { user } = session
  const { id: userId } = user
  const [activeTab, setActiveTab] = useState(initialTab)
  // @ts-ignore
  const { data: groupData = {} } = useQuery(
    ["groups", userId],
    () => fetch("/api/user/groups").then((res) => res.json()),
    { initialData: initialGroups }
  )

  const { data: groups = [] } = groupData
  // @ts-ignore
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
            Verlanglijstjes
          </Button>
          <Button
            variant={`${activeTab === "groups" ? "primary" : "secondary"}`}
            onClick={() => setActiveTab("groups")}
          >
            Groepen
          </Button>
          <Button
            variant={`${
              activeTab === "boughtPresents" ? "primary" : "secondary"
            }`}
            onClick={() => setActiveTab("boughtPresents")}
          >
            Gekochte cadeaus
          </Button>
        </nav>

        <div
          className={`${styles.tab} ${
            activeTab === "wishlists" ? styles.active : ""
          }`}
        >
          <Cards>
            {wishlists.length === 0 && (
              <p>Je hebt nog geen lijstjes gemaakt, doe dit snel! 🥳</p>
            )}

            {wishlists.map((wishlist: WishlistProperties, index: number) => (
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
        </div>

        <div
          className={`${styles.tab} ${
            activeTab === "groups" ? styles.active : ""
          }`}
        >
          <Cards>
            {groups.length === 0 && (
              <p>Je volgt nog geen groepen, doe dit snel! 🧐</p>
            )}

            {groups.map((group: GroupProperties, index: number) => (
              <CardGroup key={group.id} index={index} group={group} showEdit />
            ))}

            <CreateGroup />
          </Cards>
        </div>

        <div
          className={`${styles.tab} ${
            activeTab === "boughtPresents" ? styles.active : ""
          }`}
        >
          <BoughtPresents presents={boughtWishlistItems} />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session, query } = context

    if (!session) return { notFound: true }

    const initialTab = "groups" in query ? "groups" : "wishlists"
    const wishlistsData = await getWishlistsForUser(session?.user.id)
    const groupsData = await getGroupsForUser(session?.user.id)
    const boughtWishlistItems = await getBoughtWishlistItemsForUser(
      session?.user.id
    )

    return {
      props: {
        title: session?.user.firstName || session?.user.name,
        initialTab,
        initialWishlists: { data: wishlistsData },
        initialGroups: { data: groupsData },
        boughtWishlistItems,
      },
    }
  })
}

export default ProfilePage
