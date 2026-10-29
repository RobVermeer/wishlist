import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { getTranslations } from "next-intl/server"
import { Faq } from "@/components/Faq"
import { JsonLd } from "@/components/JsonLd"
import { authOptions } from "@/lib/nextAuth"

interface Props {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { locale } = await params

  const t = await getTranslations({ locale, namespace: "Faq" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: { index: true, follow: true },
    alternates: { canonical: "/vragen" },
  }
}

export default async function FaqPage() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Faq")
  const sections = t.raw("sections") as {
    questions: { question: string; answer: string }[]
  }[]

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: sections.flatMap(({ questions }) =>
            questions.map(({ question, answer }) => ({
              "@type": "Question",
              name: question,
              acceptedAnswer: { "@type": "Answer", text: answer },
            }))
          ),
        }}
      />
      <Faq loggedIn={!!session} />
    </>
  )
}
