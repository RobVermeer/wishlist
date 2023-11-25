import "./globals.css"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { Ubuntu } from "next/font/google"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { Header } from "@/components/Header"
import { Login } from "@/components/Login"
import { Toaster } from "@/components/ui/toaster"
import { headers } from "next/headers"
import { UserInfoDialog } from "@/components/UserInfoDialog"

const ubuntu = Ubuntu({ weight: ["400"], subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Wishlist",
    description: "Making all your dreams come true.",
    manifest: "/manifest.json",
  }
}

export async function generateViewport(): Promise<Metadata> {
  const headersList = headers()
  const colorScheme = headersList.get("sec-ch-prefers-color-scheme")

  return {
    themeColor: colorScheme === "dark" ? "#0c0a09" : "#ffffff",
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <Header session={session} />

        {session ? children : <Login />}

        {session && <UserInfoDialog session={session} />}
        <Toaster />
      </body>
    </html>
  )
}
