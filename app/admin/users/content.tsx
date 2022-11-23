"use client"

import { User } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Session } from "next-auth"
import Link from "next/link"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"

interface AdminUsersPageProps {
  userData: User[]
  session: Session
}

function AdminUsersPage({ session, userData }: AdminUsersPageProps) {
  const queryClient = useQueryClient()
  const {
    user: { id: userId },
  } = session

  // @ts-ignore
  const { data = {} } = useQuery(
    ["users"],
    () => fetch("/api/users").then((res) => res.json()),
    { initialData: { data: userData } }
  )

  const users = data?.data || []

  const remove = useMutation(
    (id: string) => {
      return fetch(`/api/users/${id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["users"])
      },
    }
  )

  function removeUser(id: string) {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    remove.mutate(id)
  }

  return (
    <div>
      <PageTitle>
        Users{" "}
        <small>
          Back to <Link href="/admin">Dashboard</Link>
        </small>
      </PageTitle>

      <Cards>
        {users.map((user: User, index: number) => (
          <Card
            key={user.id}
            title={
              <span>
                {user.name} <small>({user.firstName})</small>
                <br />
                <small>{user.email}</small>
              </span>
            }
            index={index}
            isOwn={userId === user.id}
            adornment={
              userId !== user.id && (
                <Button
                  variant="danger"
                  small
                  onClick={() => removeUser(user.id)}
                >
                  Remove
                </Button>
              )
            }
          />
        ))}
      </Cards>
    </div>
  )
}

export default AdminUsersPage
