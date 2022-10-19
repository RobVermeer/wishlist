import { useSession, signIn } from "next-auth/react"
import Link from "next/link"
import styles from "./NavBar.module.css"

export function NavBar() {
  const { data, status } = useSession()
  const loading = status === "loading"
  const loggedIn = Boolean(data)

  return (
    <nav className={styles.container}>
      <Link href="/">
        <a>
          <h1 className={styles.title}>Wishlist</h1>
        </a>
      </Link>

      {!loading && !loggedIn && (
        <button onClick={() => signIn("google")}>Login</button>
      )}

      {!loading && loggedIn && (
        <div className={styles.user}>
          <p>Logged in as {data.user.name}</p>
          <Link href="/profile">
            <a>
              <picture>
                <source srcSet={data.user.image} type="image/png" />
                <img
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
