"use client"

import { Group } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"

interface AdminGroupsPageProps {
  groupsData: Group[]
}

function AdminGroupsPage({ groupsData }: AdminGroupsPageProps) {
  const queryClient = useQueryClient()

  // @ts-ignore
  const { data = {} } = useQuery(
    ["groups"],
    () => fetch("/api/groups").then((res) => res.json()),
    { initialData: { data: groupsData } }
  )

  const groups = data?.data || []

  const remove = useMutation(
    (id: string) => {
      return fetch(`/api/groups/${id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
      },
    }
  )

  function removeGroup(id: string) {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    remove.mutate(id)
  }

  return (
    <div>
      <PageTitle>
        groups{" "}
        <small>
          Back to <Link href="/admin">Dashboard</Link>
        </small>
      </PageTitle>

      <Cards>
        {groups.map((group: any, index: number) => (
          <Card
            key={group.id}
            title={
              <span>
                {group.title}
                <br />
                <small>{group.createdBy.name}</small>
              </span>
            }
            index={index}
            adornment={
              <Button
                variant="danger"
                small
                onClick={() => removeGroup(group.id)}
              >
                Remove
              </Button>
            }
          />
        ))}
      </Cards>
    </div>
  )
}

export default AdminGroupsPage
