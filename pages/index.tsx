import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Cards } from "../components/Card"
import { PageTitle } from "../components/PageTitle"
import styles from "../styles/Home.module.css"

function HomePage() {
  const { data: userData } = useSession()
  const { data = {} } = useQuery(["groups"], () =>
    fetch("/api/groups").then((res) => res.json())
  )
  const { data: groups = [] } = data

  return (
    <div className={styles.container}>
      {userData && (
        <>
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
        </>
      )}
    </div>
  )
}

export default HomePage
