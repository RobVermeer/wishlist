import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { HouseRules } from "@/components/HouseRules"
import { getSession } from "@/lib/getSession"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "HouseRules" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: { canonical: "/huisregels" },
  }
}

export default async function HouseRulesPage() {
  const session = await getSession()

  return <HouseRules loggedIn={!!session} />
}
