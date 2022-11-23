"use client"

import { signIn } from "next-auth/react"
import { Button } from "~/components/Button"
import { EmptyState } from "~/components/EmptyState"

export const NotLoggedIn = () => (
  <EmptyState
    title="👋 Welkom! 👋"
    text="Maak een account aan of log in om te starten! 🎁"
    buttons={
      <>
        {/* <Button onClick={() => signIn("instagram")}>
          Inloggen met Instagram
        </Button> */}
        <Button onClick={() => signIn("google")} variant="primary">
          Inloggen met Google
        </Button>
      </>
    }
  />
)
