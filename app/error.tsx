"use client"

import { useRouter } from "next/navigation"
import { Button } from "~/components/Button"
import { EmptyState } from "~/components/EmptyState"

export default function Custom404() {
  const { push } = useRouter()

  return (
    <EmptyState
      title="🤯 Oeps, er ging iets mis! 🤯"
      text="Klik op onderstaande button om terug naar home te gaan"
      buttons={
        <Button variant="primary" onClick={() => push("/")}>
          Home
        </Button>
      }
    />
  )
}
