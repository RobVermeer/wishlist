import { signIn } from "next-auth/react"
import styles from "./NotLoggedIn.module.css"

export const NotLoggedIn = () => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>👋 Welkom! 👋</h2>
      <p className={styles.text}>
        Maak een account aan of log in om te starten! 🎁
      </p>
      <div className={styles.buttons}>
        <button onClick={() => signIn("google")}>Registreren</button>
        <button onClick={() => signIn("google")}>Inloggen</button>
      </div>
    </div>
  )
}
