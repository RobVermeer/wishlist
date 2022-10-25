import Link from "next/link"
import styles from "./NavBar.module.css"

export function NavBar({ session }) {
  const loggedIn = Boolean(session)

  return (
    <nav className={`${styles.container} ${loggedIn ? styles.loggedIn : ""}`}>
      <h1 className={styles.title}>
        <Link href="/">🎁 Wishlist</Link>
      </h1>

      {loggedIn && (
        <div className={styles.user}>
          <p>
            Ingelogd als <Link href="/profile">{session.user.name}</Link>
          </p>
          <Link href="/profile">
            <a>
              <picture>
                <source srcSet={session.user.image} type="image/png" />
                <img
                  referrerPolicy="no-referrer"
                  src={session.user.image}
                  alt={`Avatar of ${session.user.name}`}
                  width="96"
                  height="96"
                />
              </picture>
            </a>
          </Link>
        </div>
      )}
    </nav>
  )
}
