import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { PageTitle } from "~/components/PageTitle"
import { withBaseProps } from "~/utils/withBaseProps"
import styles from "~/styles/Profile.module.css"

function AdminDashboardPage() {
  const { push } = useRouter()

  return (
    <div>
      <PageTitle>Admin</PageTitle>

      <div className={styles.tabs}>
        <nav>
          <Button onClick={() => push("/admin/users")}>Users</Button>
          <Button onClick={() => push("/admin/groups")}>Groups</Button>
        </nav>
      </div>
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

    return {
      props: {},
    }
  })
}

export default AdminDashboardPage
