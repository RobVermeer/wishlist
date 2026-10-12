import "./globals.css"
import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { Ubuntu } from "next/font/google"
import { authOptions } from "@/lib/nextAuth"
import { Header } from "@/components/Header"
import { Toaster } from "@/components/ui/toaster"
import { headers } from "next/headers"
import { UserInfoDialog } from "@/components/UserInfoDialog"
import { Layout } from "@/components/Layout"
import { NextIntlClientProvider } from "next-intl"

const ubuntu = Ubuntu({ weight: ["400"], subsets: ["latin"] })

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Wishlist",
    description: "Making all your dreams come true.",
    manifest: "/manifest.json",
  }
}

export async function generateViewport(): Promise<Metadata> {
  const headersList = await headers()
  const colorScheme = headersList.get("sec-ch-prefers-color-scheme")

  return {
    themeColor: colorScheme === "dark" ? "#0c0a09" : "#ffffff",
  }
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale}>
      <body className={ubuntu.className}>
        <NextIntlClientProvider>
          <Header session={session} />

          <Layout>{children}</Layout>

          {session && <UserInfoDialog session={session} />}

          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
