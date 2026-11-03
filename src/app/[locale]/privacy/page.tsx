import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Privacy } from "@/components/Privacy"
import { getSession } from "@/lib/getSession"

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
  const session = await getSession()

  return <Privacy loggedIn={!!session} />
}
