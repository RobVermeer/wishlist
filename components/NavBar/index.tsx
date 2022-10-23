import { useSession } from "next-auth/react"
import Link from "next/link"
import styles from "./NavBar.module.css"

export function NavBar() {
  const { data, status } = useSession()
  const loading = status === "loading"
  const loggedIn = Boolean(data)

  return (
    <nav className={styles.container}>
      <h1 className={styles.title}>
        <Link href="/">🎁 Wishlist</Link>
      </h1>

      {!loading && loggedIn && (
        <div className={styles.user}>
          <p>
            Ingelogd als <Link href="/profile">{data.user.name}</Link>
          </p>
          <Link href="/profile">
            <a>
              <picture>
                <source srcSet={data.user.image} type="image/png" />
                <img
                  referrerPolicy="no-referrer"
                  src={data.user.image}
                  alt={`Avatar of ${data.user.name}`}
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
