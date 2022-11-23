"use client"

import { useRouter } from "next/navigation"
import { Button } from "~/components/Button"
import { PageTitle } from "~/components/PageTitle"
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

export default AdminDashboardPage
