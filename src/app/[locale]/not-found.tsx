import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function NotFound() {
  const session = await getServerSession(authOptions)

  return (
    <>
      <Header session={session} />

      <Layout>
        <EmptyState title="Oeps, we konden deze pagina niet vinden! 🤯">
          Ga terug naar{" "}
          <Link className="text-primary" href="/">
            het overzicht
          </Link>
        </EmptyState>
      </Layout>
    </>
  )
}
