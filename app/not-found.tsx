"use client"

import { useRouter } from "next/navigation"
import { Button } from "~/components/Button"
import { EmptyState } from "~/components/EmptyState"

export default function NotFound() {
  const { push } = useRouter()

  return (
    <EmptyState
      title="🤯 Oeps, we konden deze pagina niet vinden! 🤯"
      text="Klik op onderstaande button om terug naar home te gaan"
      buttons={
        <Button variant="primary" onClick={() => push("/")}>
          Home
        </Button>
      }
    />
  )
}
