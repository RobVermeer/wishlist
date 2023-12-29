import "./globals.css"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { Ubuntu } from "next/font/google"
import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { Header } from "@/components/Header"
import { Toaster } from "@/components/ui/toaster"
import { headers } from "next/headers"
import { UserInfoDialog } from "@/components/UserInfoDialog"
import { Layout } from "@/components/Layout"
import { getMessages } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { pickMessages } from "@/utils/pick"

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
  const messages = await getMessages()

  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <NextIntlClientProvider messages={pickMessages(messages, "Menu")}>
          <Header session={session} />
        </NextIntlClientProvider>

        <Layout>{children}</Layout>

        {session && (
          <NextIntlClientProvider messages={pickMessages(messages, "UserInfo")}>
            <UserInfoDialog session={session} />
          </NextIntlClientProvider>
        )}

        <Toaster />
      </body>
    </html>
  )
}
