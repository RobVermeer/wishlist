import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { CreateGroup } from "~/components/CreateGroup"
import { CreateWishlist } from "~/components/CreateWishlist"
import { EditGroup } from "~/components/EditGroup"
import { EditWishlist } from "~/components/EditWishlist"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfilePage({ session, initialTab }) {
  const { push } = useRouter()
  const { userId } = session
  const [activeTab, setActiveTab] = useState(initialTab)
  const { data: groupData = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )

  const { data: groups = [] } = groupData
  const { data: wishlistData = {} } = useQuery(["wishlists", userId], () =>
    fetch("/api/user/wishlists").then((res) => res.json())
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
              {wishlists.map((wishlist, index) => {
                const inGroups = wishlist.groups
                  .map(({ title }) => title)
                  .join(", ")
                  .replace(/,([^,]+)$/i, " & $1")

                return (
                  <Card
                    key={wishlist.id}
                    index={index}
                    link={`/profile/wishlists/${wishlist.id}`}
                    title={
                      <span className={styles.wishlistTitle}>
                        {wishlist.title || "Mijn lijstje"}{" "}
                        {inGroups ? (
                          <small>{`in groep${
                            wishlist.groups.length > 1 ? "en" : ""
                          } ${inGroups}`}</small>
                        ) : null}
                      </span>
                    }
                    adornment={<EditWishlist wishlist={wishlist} />}
                  />
                )
              })}
            </Cards>
          )}

          <CreateWishlist userId={userId} />
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
                <Card
                  key={group.id}
                  index={index}
                  link={`/group/${group.id}`}
                  title={group.title}
                  adornment={
                    group.createdBy.id === userId && <EditGroup group={group} />
                  }
                />
              ))}
            </Cards>
          )}

          <CreateGroup />
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session, query } = context
    const initialTab = "groups" in query ? "groups" : "wishlists"

    return { props: { title: session.user.name, initialTab } }
  })
}

export default ProfilePage
