import { User } from "@prisma/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import Link from "next/link"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import { getUsers } from "~/lib/users/getUsers"
import { withBaseProps } from "~/utils/withBaseProps"
import styles from "./AdminUser.module.css"

interface AdminUsersPageProps {
  userData: User[]
  session: Session
}

function AdminUsersPage({ session, userData }: AdminUsersPageProps) {
  const queryClient = useQueryClient()
  const { user } = session
  const { id: userId } = user

  // @ts-ignore
  const { data = {} } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((res) => res.json()),
    initialData: { data: userData },
  })

  const users = data?.data || []

  const remove = useMutation({
    mutationFn: (id: string) => {
      return fetch(`/api/users/${id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["users"])
    },
  })

  async function removeUser(id: string) {
    const confirm = window.confirm("Are you sure?")

    if (!confirm) return

    await remove.mutate(id)
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
              <div className={styles.user}>
                <picture>
                  <img
                    referrerPolicy="no-referrer"
                    src={user?.image || "/avatar.svg"}
                    alt={`Avatar of ${user.firstName || user?.name}`}
                    width="96"
                    height="96"
                  />
                </picture>
                <span>
                  {user.name} <small>({user.firstName})</small>
                  <br />
                  <small>{user.email}</small>
                </span>
              </div>
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

    if (!session || !session.user.isAdmin) {
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

export default AdminUsersPage
