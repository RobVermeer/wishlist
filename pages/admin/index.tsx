import { User } from "@prisma/client"
import { GetServerSideProps } from "next"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { PageTitle } from "~/components/PageTitle"
import { getUsers } from "~/lib/users/getUsers"
import { withBaseProps } from "~/utils/withBaseProps"

interface AdminDashboardPageProps {
  userData: User[]
}

function AdminDashboardPage({ userData }: AdminDashboardPageProps) {
  return (
    <div>
      <PageTitle>Users</PageTitle>
      <Cards>
        {userData.map((user, index) => (
          <Card key={user.id} title={user.name} index={index} />
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
