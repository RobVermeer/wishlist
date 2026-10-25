import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { ContactForm } from "@/components/ContactForm"

interface Section {
  title: string
  questions: { question: string; answer: string }[]
}

export const Faq = () => {
  const t = useTranslations("Faq")
  const sections = t.raw("sections") as Section[]

  return (
    <>
      <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>

      {sections.map(section => (
        <List key={section.title}>
          <ListTitle>{section.title}</ListTitle>

          {section.questions.map(({ question, answer }) => (
            <details
              key={question}
              className="group rounded-md bg-secondary px-4 py-3"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-2 font-semibold [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  aria-hidden
                  size="20"
                  className="mt-0.5 shrink-0 text-primary transition-transform group-open:rotate-180"
                />
              </summary>
              <p className="mt-2 text-muted-foreground">{answer}</p>
            </details>
          ))}
        </List>
      ))}

      <section className="grid gap-3 rounded-lg bg-secondary p-6 text-center">
        <h2 className="text-xl font-semibold">{t("contact.title")}</h2>
        <p className="text-muted-foreground">{t("contact.text")}</p>
        <ContactForm />
      </section>
    </>
  )
}
