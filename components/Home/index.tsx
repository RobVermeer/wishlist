import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { CSSProperties } from "react"
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
      <PageTitle>Groepen die je volgt</PageTitle>
      <Cards>
        {groups.map((group, index) => (
          <Link key={group.id} href={`/group/${group.id}`}>
            <a style={{ "--_index": index } as CSSProperties}>
              {group.title} <small>({group.wishlist.length})</small>
            </a>
          </Link>
        ))}
      </Cards>
    </div>
  )
}
