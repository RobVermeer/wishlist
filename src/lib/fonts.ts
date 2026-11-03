import { Figtree, Fraunces } from "next/font/google"

export const body = Figtree({ subsets: ["latin"], variable: "--font-body" })
export const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  axes: ["SOFT", "opsz"],
})
