import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { CSSProperties, useState } from "react"
import { Button } from "~/components/Button"
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
          <Button
            variant="danger"
            onClick={async () => {
              await signOut({ redirect: false, callbackUrl: "/" })
              await push("/")
            }}
          >
            Uitloggen
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
                <Link
                  key={wishlist.id}
                  href={`/profile/wishlists/${wishlist.id}`}
                >
                  <a style={{ "--_index": index } as CSSProperties}>
                    {wishlist.title || "Mijn lijstje"}{" "}
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
          )}

          <Button onClick={() => push("/profile/wishlists")}>
            Beheer verlanglijstjes
          </Button>
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
                <Link key={group.id} href={`/group/${group.id}`}>
                  <a style={{ "--_index": index } as CSSProperties}>
                    {group.title}
                  </a>
                </Link>
              ))}
            </Cards>
          )}

          <Button onClick={() => push("/profile/groups")}>
            Beheer groepen
          </Button>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({ props: { title: "Profile" } }))
}

export default ProfilePage
