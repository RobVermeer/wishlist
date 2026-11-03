import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Faq } from "@/components/Faq"
import { JsonLd } from "@/components/JsonLd"
import { getSession } from "@/lib/getSession"

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
  const session = await getSession()
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
              acceptedAnswer: {
                "@type": "Answer",
                // Search engines get the text of links, not the markup.
                text: answer.replace(/<\/?\w+>/g, ""),
              },
            }))
          ),
        }}
      />
      <Faq loggedIn={!!session} />
    </>
  )
}
