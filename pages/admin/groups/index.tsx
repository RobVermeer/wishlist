import { Group, User } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import Link from "next/link"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import { getGroups } from "~/lib/groups/getGroups"
import { getUsers } from "~/lib/users/getUsers"
import { withBaseProps } from "~/utils/withBaseProps"

interface AdminGroupsPageProps {
  userData: User[]
  session: Session
}

function AdminGroupsPage({ session, groupsData }: AdminGroupsPageProps) {
  const queryClient = useQueryClient()
  const { userId } = session

  // @ts-ignore
  const { data = {} } = useQuery(
    ["usgroupsers"],
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

  async function removeGroup(id: string) {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await remove.mutate(id)
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
        {groups.map((group: Group, index: number) => (
          <Card
            key={group.id}
            title={
              <span>
                {group.title} <small>({group.slug})</small>
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session || !session.isAdmin) {
      return {
        notFound: true,
      }
    }

    const data = await getGroups()

    return {
      props: {
        groupsData: data,
      },
    }
  })
}

export default AdminGroupsPage
