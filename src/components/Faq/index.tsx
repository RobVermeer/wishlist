import {
  ArrowUp,
  ChevronDown,
  ChevronRight,
  Dices,
  Gift,
  Info,
  ScrollText,
  UserRound,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"
import { ContactForm } from "@/components/ContactForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Section {
  id: string
  title: string
  questions: { question: string; answer: string }[]
}

const icons: Record<string, typeof Gift> = {
  algemeen: Info,
  "je-verlanglijstje": ScrollText,
  "delen-en-groepen": Users,
  "lootjes-trekken": Dices,
  "cadeaus-kopen": Gift,
  "je-account": UserRound,
}

interface Props {
  loggedIn: boolean
}

export const Faq = ({ loggedIn }: Props) => {
  const t = useTranslations("Faq")
  const sections = t.raw("sections") as Section[]

  return (
    <>
      <div id="top" className="grid scroll-mt-24 gap-1">
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>

      <nav aria-label={t("subjects")}>
        <ul className="grid gap-2">
          {sections.map(({ id, title, questions }) => {
            const Icon = icons[id] ?? ScrollText

            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-center gap-3 rounded-md bg-secondary px-4 py-3 transition-colors hover:bg-secondary/70"
                >
                  <Icon
                    aria-hidden
                    size="20"
                    className="shrink-0 text-primary"
                  />
                  <span className="flex-1 font-semibold">{title}</span>
                  <span className="text-sm text-muted-foreground">
                    {t("questions", { count: questions.length })}
                  </span>
                  <ChevronRight
                    aria-hidden
                    size="18"
                    className="shrink-0 text-muted-foreground"
                  />
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      {sections.map(({ id, title, questions }, sectionIndex) => (
        <section
          key={id}
          id={id}
          aria-labelledby={`${id}-title`}
          className="grid scroll-mt-24 gap-2"
        >
          <ListTitle>
            <span id={`${id}-title`}>{title}</span>
          </ListTitle>

          {questions.map(({ question }, index) => (
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
              <p className="mt-2 text-muted-foreground">
                {t.rich(`sections.${sectionIndex}.questions.${index}.answer`, {
                  privacy: chunks => (
                    <Link
                      href="/privacy"
                      className="text-primary underline underline-offset-2"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </details>
          ))}

          <a
            href="#top"
            className="flex items-center gap-1 justify-self-end text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowUp aria-hidden size="14" /> {t("top")}
          </a>
        </section>
      ))}

      <section
        id="stel-je-vraag"
        className="grid scroll-mt-24 gap-3 rounded-lg bg-secondary p-6 text-center"
      >
        <h2 className="text-xl font-semibold">{t("contact.title")}</h2>
        <p className="text-muted-foreground">{t("contact.text")}</p>
        {loggedIn ? (
          <ContactForm />
        ) : (
          <Button asChild variant="outline" className="justify-self-center">
            <Link href={`/login?callbackUrl=${encodeURIComponent("/vragen")}`}>
              {t("contact.login")}
            </Link>
          </Button>
        )}
      </section>
    </>
  )
}
