import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { HouseRules } from "@/components/HouseRules"
import { authOptions } from "@/lib/nextAuth"

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
  const session = await getServerSession(authOptions)

  return <HouseRules loggedIn={!!session} />
}
