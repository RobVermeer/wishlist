import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/router"
import { PageTitle } from "../../../components/PageTitle"
import styles from "../../../styles/Profile.module.css"

function ProfileGroupsPage() {
  const { push } = useRouter()
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["groups"], () =>
    fetch("/api/groups").then((res) => res.json())
  )
  const { data: groups = [] } = data
  const subscribe = useMutation(
    (groupId) => {
      return fetch("/api/user/subscribe", {
        method: "put",
        body: JSON.stringify({ groupId }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
        queryClient.invalidateQueries(["reminders"])
      },
    }
  )

  console.log(subscribe)

  return (
    <div className={styles.container}>
      <PageTitle>Manage groups</PageTitle>
      <ul>
        {groups.map((group) => {
          console.log(group)

          return (
            <li key={group.id}>
              <input
                type="checkbox"
                checked={group.isSubscribed}
                onClick={() => subscribe.mutate(group.id)}
              />{" "}
              {group.title}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ProfileGroupsPage
