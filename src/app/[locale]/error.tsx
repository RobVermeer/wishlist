"use client"

import { EmptyState } from "@/components/EmptyState"
import Link from "next/link"

export default function Error() {
  return (
    <EmptyState title="Oeps, er ging iets mis! 🤯">
      Ga terug naar{" "}
      <Link className="text-primary" href="/">
        het overzicht
      </Link>
    </EmptyState>
  )
}
