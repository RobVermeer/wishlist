import { useRouter } from "next/router"
import { Button } from "~/components/Button"
import { EmptyState } from "~/components/EmptyState"

export default function Custom404() {
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
