import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { Faq } from "@/components/Faq"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: Props) => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Faq" })

  return {
    title: t("metaTitle"),
  }
}

export default async function FaqPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect(`/login?callbackUrl=${encodeURIComponent("/vragen")}`)

  return <Faq />
}
