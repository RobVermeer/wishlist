import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useRouter } from "next/router"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"

function GroupPage() {
  const { query } = useRouter()
  const { data = {} } = useQuery(["groupLists", query.id], () =>
    fetch(`/api/groups/${query.id}`).then((res) => res.json())
  )
  const { data: group } = data

  if (!group) return <div></div>

  return (
    <div className={styles.container}>
      <PageTitle>{group.title}</PageTitle>
      <Cards>
        {group.wishlist.map((wishlist) => (
          <Link key={wishlist.id} href={`/group/${query.id}/${wishlist.id}`}>
            <a>{wishlist.title || wishlist.user.name}</a>
          </Link>
        ))}
      </Cards>
    </div>
  )
}

export default GroupPage
