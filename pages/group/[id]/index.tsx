import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { CSSProperties } from "react"
import { Button } from "~/components/Button"
import { Cards } from "~/components/Card"
import { EmptyState } from "~/components/EmptyState"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"

function GroupPage() {
  const { query, push } = useRouter()
  const { data = {} } = useQuery(["groupLists", query.id], () =>
    fetch(`/api/groups/${query.id}`).then((res) => res.json())
  )
  const { data: group } = data

  if (!group) return <div></div>

  if (group.wishlist.length === 0)
    return (
      <EmptyState
        title="😵‍💫 Er zijn nog geen lijstjes! 😵‍💫"
        text="Maak als eerste een lijstje aan in je profiel! 🤑"
        buttons={
          <>
            <Button onClick={() => push("/profile")}>Bekijk je profiel</Button>
            <Button
              variant="primary"
              onClick={() => push("/profile/wishlists")}
            >
              Ga direct naar je wensenlijstjes
            </Button>
          </>
        }
      />
    )

  return (
    <div className={styles.container}>
      <PageTitle>{group.title}</PageTitle>

      <Cards>
        {group.wishlist.map((wishlist, index) => (
          <Link key={wishlist.id} href={`/group/${query.id}/${wishlist.id}`}>
            <a style={{ "--_index": index } as CSSProperties}>
              {wishlist.title || wishlist.user.name}
            </a>
          </Link>
        ))}
      </Cards>
    </div>
  )
}

export default GroupPage
