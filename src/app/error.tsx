"use client"

import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import Link from "next/link"

export default function Error() {
  return (
    <>
      <Header session={null} />

      <Layout>
        <EmptyState title="Oeps, er ging iets mis! 🤯">
          Ga terug naar{" "}
          <Link className="text-primary" href="/">
            het overzicht
          </Link>
        </EmptyState>
      </Layout>
    </>
  )
}
