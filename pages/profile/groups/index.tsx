import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useState } from "react"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfileGroupsPage({ session }) {
  const [title, setTitle] = useState("")
  const { userId } = session
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["groups"], () =>
    fetch("/api/groups").then((res) => res.json())
  )
  const { data: groups = [] } = data
  const subscribe = useMutation(
    (groupId) => {
      return fetch(`/api/user/groups/${groupId}/subscribe`, {
        method: "put",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
      },
    }
  )
  const remove = useMutation(
    (groupId) => {
      return fetch(`/api/user/groups/${groupId}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
      },
    }
  )
  const create = useMutation(
    () => {
      return fetch("/api/user/groups/create", {
        method: "post",
        body: JSON.stringify({ title }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        setTitle("")
        queryClient.invalidateQueries(["groups"])
      },
    }
  )
  const update = useMutation(
    ({ id, data }: { id: string; data: object }) => {
      return fetch(`/api/user/groups/${id}/edit`, {
        method: "put",
        body: JSON.stringify(data),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
      },
    }
  )

  return (
    <div className={styles.container}>
      <PageTitle>Manage groups</PageTitle>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <input
              type="checkbox"
              checked={group.members.some(({ id }) => id === userId)}
              onChange={() => subscribe.mutate(group.id)}
            />{" "}
            {group.title}{" "}
            {group.createdBy.id === userId && (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  const form = event.target as HTMLFormElement
                  const data = new FormData(form)
                  update.mutate({
                    id: group.id,
                    data: {
                      title: data.get("title"),
                    },
                  })
                }}
              >
                <input type="text" name="title" defaultValue={group.title} />
                <button type="submit">Edit group</button>
              </form>
            )}
            {group.createdBy.id === userId && (
              <button onClick={() => remove.mutate(group.id)}>remove</button>
            )}
          </li>
        ))}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate()
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit">New group</button>
      </form>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Profile - Groups" },
  }))
}

export default ProfileGroupsPage
