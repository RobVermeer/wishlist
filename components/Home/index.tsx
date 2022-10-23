import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Home.module.css"

export const Home = ({ userId }) => {
  const { data = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )
  const { data: groups = [] } = data

  return (
    <div className={styles.container}>
      <PageTitle>Your groups</PageTitle>
      <Cards>
        {groups.map((group) => (
          <Link key={group.id} href={`/group/${group.id}`}>
            <a>
              {group.title} <small>({group.wishlist.length})</small>
            </a>
          </Link>
        ))}
      </Cards>
    </div>
  )
}
