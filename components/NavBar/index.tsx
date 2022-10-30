import { Session } from "next-auth"
import Link from "next/link"
import styles from "./NavBar.module.css"

interface NavBarProps {
  session: Session | null
}
export function NavBar({ session }: NavBarProps) {
  const loggedIn = Boolean(session)
  // @ts-ignore
  const { user, firstName } = session || {}

  return (
    <nav className={`${styles.container} ${loggedIn ? styles.loggedIn : ""}`}>
      <h1 className={styles.title}>
        <Link href="/">🎁 Wishlist</Link>
      </h1>

      {loggedIn && (
        <div className={styles.user}>
          <p>
            Ingelogd als{" "}
            <Link href="/profile" legacyBehavior>
              {firstName || user?.name}
            </Link>
          </p>
          <Link href="/profile">
            <picture>
              <img
                referrerPolicy="no-referrer"
                src={user?.image as string}
                alt={`Avatar of ${firstName || user?.name}`}
                width="96"
                height="96"
              />
            </picture>
          </Link>
        </div>
      )}
    </nav>
  )
}
