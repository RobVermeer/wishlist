import { signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { PageTitle } from "~/components/PageTitle"
import styles from "./ProfileNavBar.module.css"

export function ProfileNavBar() {
  const { push } = useRouter()

  return (
    <nav className={styles.profileTitle}>
      <PageTitle>Profiel</PageTitle>
      <Button
        variant="danger"
        onClick={async () => {
          await signOut({ redirect: false, callbackUrl: "/" })
          await push("/")
        }}
        small
      >
        Uitloggen
      </Button>
    </nav>
  )
}
