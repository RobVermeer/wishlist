import { signIn } from "next-auth/react"
import { Button } from "../Button"
import { EmptyState } from "../EmptyState"

export const NotLoggedIn = () => (
  <EmptyState
    title="👋 Welkom! 👋"
    text="Maak een account aan of log in om te starten! 🎁"
    buttons={
      <>
        <Button onClick={() => signIn("google")}>Registreren</Button>
        <Button onClick={() => signIn("google")}>Inloggen</Button>
      </>
    }
  />
)
