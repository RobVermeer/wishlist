import { User } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import { getUsers } from "~/lib/users/getUsers"
import { withBaseProps } from "~/utils/withBaseProps"

interface AdminDashboardPageProps {
  userData: User[]
  session: Session
}

function AdminDashboardPage({ session, userData }: AdminDashboardPageProps) {
  const queryClient = useQueryClient()
  const { userId } = session

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

  async function removeUser(id: string) {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await remove.mutate(id)
  }

  return (
    <div>
      <PageTitle>Users</PageTitle>
      <Cards>
        {users.map((user: User, index: number) => (
          <Card
            key={user.id}
            title={
              <span>
                {user.name}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session || !session.isAdmin) {
      return {
        notFound: true,
      }
    }

    const data = await getUsers()

    return {
      props: {
        userData: data,
      },
    }
  })
}

export default AdminDashboardPage
