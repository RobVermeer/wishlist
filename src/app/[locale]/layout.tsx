import "./globals.css"
import type { Metadata, Viewport } from "next"
import { getSession } from "@/lib/getSession"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/toaster"
import { UserInfoDialog } from "@/components/UserInfoDialog"
import { Layout } from "@/components/Layout"
import { NavigationStatus } from "@/components/NavigationStatus"
import { NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { siteUrl } from "@/lib/siteUrl"
import { body, heading } from "@/lib/fonts"
import { openGraphImage } from "@/lib/openGraph"

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
      siteName: "Niet Weer Sokken",
      locale: "nl_NL",
      title: t("title"),
      description: t("description"),
      images: [openGraphImage],
    },
    twitter: { card: "summary_large_image" },
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      title: "Niet Weer Sokken",
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
  const session = await getSession()

  return (
    <html lang={locale}>
      <body
        className={`${body.variable} ${heading.variable} flex min-h-dvh flex-col`}
      >
        <NextIntlClientProvider>
          <Header session={session} />

          <Layout>{children}</Layout>

          <Footer loggedIn={!!session} />

          {session && <UserInfoDialog session={session} />}

          <Toaster />
          <NavigationStatus />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
