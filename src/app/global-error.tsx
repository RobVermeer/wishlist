"use client"

import "./[locale]/globals.css"
import dynamic from "next/dynamic"
import { body, heading } from "@/lib/fonts"

// Loaded only when it's shown: it brings all texts, and every page loads this
// file.
const GlobalErrorContent = dynamic(() =>
  import("@/components/GlobalError").then(({ GlobalError }) => GlobalError)
)

// Replaces the root layout when it fails, so it brings its own document,
// fonts and texts.
export default function GlobalError() {
  return (
    <html lang="nl">
      <body
        className={`${body.variable} ${heading.variable} flex min-h-dvh flex-col`}
      >
        <GlobalErrorContent />
      </body>
    </html>
  )
}
