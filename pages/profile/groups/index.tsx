import { useQuery } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { PageTitle } from "../../../components/PageTitle"
import styles from "../../../styles/Profile.module.css"

function ProfileGroupsPage() {
  const { push } = useRouter()
  const { data = {} } = useQuery(["groups"], () =>
    fetch("/api/groups").then((res) => res.json())
  )
  const { data: groups = [] } = data

  return (
    <div className={styles.container}>
      <PageTitle>Manage groups</PageTitle>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <input type="checkbox" /> {group.title}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProfileGroupsPage
