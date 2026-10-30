import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { Privacy } from "@/components/Privacy"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Privacy" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: { canonical: "/privacy" },
  }
}

export default async function PrivacyPage() {
  const session = await getServerSession(authOptions)

  return <Privacy loggedIn={!!session} />
}
