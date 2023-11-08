"use client"

import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import Link from "next/link"

export default function Error() {
  return (
    <Layout>
      <EmptyState title="Oeps, er ging iets mis! 🤯">
        Ga terug naar <Link href="/">het overzicht</Link>
      </EmptyState>
    </Layout>
  )
}
