import Link from "next/link"
import { useTranslations } from "next-intl"
import { SockIcon } from "@/components/SockIcon"
import { InstallAppLink } from "@/components/InstallAppLink"

const linkClassName =
  "rounded-sm transition-colors hover:text-primary hover:underline"

interface Props {
  loggedIn: boolean
}

export function Footer({ loggedIn }: Props) {
  const t = useTranslations("Footer")

  return (
    <footer className="mx-auto mt-auto w-full px-4 pb-6 text-sm text-muted-foreground md:max-w-[640px]">
      <div className="grid gap-4 border-t pt-6 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="grid gap-1.5">
          <Link
            href="/"
            className="flex items-center gap-2 justify-self-start font-display text-lg font-semibold leading-none tracking-tight text-foreground"
          >
            <span className="flex size-7 -rotate-6 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <SockIcon size={20} />
            </span>
            Niet Weer Sokken
          </Link>
          <p>{t("tagline")}</p>
        </div>

        <nav aria-label={t("links")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
            <li>
              <Link href="/vragen" className={linkClassName}>
                {t("faq")}
              </Link>
            </li>
            <li>
              <Link href="/vragen#stel-je-vraag" className={linkClassName}>
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className={linkClassName}>
                {t("privacy")}
              </Link>
            </li>
            <InstallAppLink loggedIn={loggedIn} className={linkClassName} />
          </ul>
        </nav>
      </div>

      <p className="mt-4 text-xs">
        {t("copyright", { year: new Date().getFullYear() })}
      </p>
    </footer>
  )
}
