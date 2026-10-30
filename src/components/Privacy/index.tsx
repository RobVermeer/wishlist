import { useTranslations } from "next-intl"
import Link from "next/link"
import { ListTitle } from "@/components/ListTitle"
import { ContactForm } from "@/components/ContactForm"
import { Button } from "@/components/ui/button"

interface Section {
  id: string
  title: string
  text?: string[]
  items?: string[]
  more?: string[]
}

interface Props {
  loggedIn: boolean
}

export const Privacy = ({ loggedIn }: Props) => {
  const t = useTranslations("Privacy")
  const sections = t.raw("sections") as Section[]

  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-4xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("intro")}</p>
        <p className="text-sm text-muted-foreground">{t("updated")}</p>
      </div>

      {sections.map(({ id, title, text = [], items = [], more = [] }) => (
        <section
          key={id}
          id={id}
          aria-labelledby={`${id}-title`}
          className="grid scroll-mt-24 gap-3"
        >
          <ListTitle>
            <span id={`${id}-title`}>{title}</span>
          </ListTitle>

          {text.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          {items.length > 0 && (
            <ul className="grid list-disc gap-1 pl-6 marker:text-primary">
              {items.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          {more.map(paragraph => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>
      ))}

      <section className="grid gap-3 rounded-lg bg-secondary p-6 text-center">
        <h2 className="text-xl font-semibold">{t("contact.title")}</h2>
        <p className="text-muted-foreground">{t("contact.text")}</p>
        {loggedIn ? (
          <ContactForm />
        ) : (
          <Button asChild variant="outline" className="justify-self-center">
            <Link href={`/login?callbackUrl=${encodeURIComponent("/privacy")}`}>
              {t("contact.login")}
            </Link>
          </Button>
        )}
      </section>
    </>
  )
}
