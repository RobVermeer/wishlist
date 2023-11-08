import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import Link from "next/link"

export default function NotFound() {
  return (
    <Layout>
      <EmptyState title="Oeps, we konden deze pagina niet vinden! 🤯">
        Ga terug naar <Link href="/">het overzicht</Link>
      </EmptyState>
    </Layout>
  )
}
