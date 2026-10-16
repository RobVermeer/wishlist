"use client"

import { Gift, ScrollText, Users } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"

const tabs = [
  { key: "mine", href: "/", icon: ScrollText, matches: ["/wishlist"] },
  { key: "others", href: "/for-others", icon: Users, matches: ["/group"] },
  { key: "presents", href: "/presents", icon: Gift, matches: [] },
] as const

export const MainNav = () => {
  const pathname = usePathname()
  const t = useTranslations("MainNav")

  const isActive = ({ href, matches }: (typeof tabs)[number]) =>
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`)) ||
    matches.some(path => pathname.startsWith(`${path}/`))

  return (
    <nav
      aria-label={t("label")}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] sm:static sm:border-t-0 sm:border-b sm:pb-0"
    >
      <div className="mx-auto grid grid-cols-3 md:max-w-[592px]">
        {tabs.map(tab => {
          const active = isActive(tab)
          const Icon = tab.icon

          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={clsx(
                "flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors sm:flex-row sm:justify-center sm:gap-2 sm:py-3 sm:text-sm sm:border-b-2",
                active
                  ? "text-primary sm:border-primary"
                  : "text-muted-foreground hover:text-foreground sm:border-transparent"
              )}
            >
              <Icon size="20" strokeWidth={active ? 2.5 : 2} />
              {t(tab.key)}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
