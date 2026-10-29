import "./globals.css"
import type { Metadata, Viewport } from "next"
import { getServerSession } from "next-auth"
import { Figtree, Fraunces } from "next/font/google"
import { authOptions } from "@/lib/nextAuth"
import { Header } from "@/components/Header"
import { Toaster } from "@/components/ui/toaster"
import { UserInfoDialog } from "@/components/UserInfoDialog"
import { Layout } from "@/components/Layout"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { siteUrl } from "@/lib/siteUrl"
import { openGraphImage } from "@/lib/openGraph"

const body = Figtree({ subsets: ["latin"], variable: "--font-body" })
const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  axes: ["SOFT", "opsz"],
})

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")

  return {
    metadataBase: siteUrl,
    title: t("title"),
    description: t("description"),
    // Only pages meant for search results opt in, everything else is private.
    robots: { index: false, follow: true },
    openGraph: {
      type: "website",
      siteName: "Wishlist",
      locale: "nl_NL",
      title: t("title"),
      description: t("description"),
      images: [openGraphImage],
    },
    twitter: { card: "summary_large_image" },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      title: "Wishlist",
      statusBarStyle: "default",
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#db243c" },
    { media: "(prefers-color-scheme: dark)", color: "#c72339" },
  ],
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
      <body className={`${body.variable} ${heading.variable}`}>
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
