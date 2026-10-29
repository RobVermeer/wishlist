import { Session } from "next-auth"
import Link from "next/link"
import { CircleHelp } from "lucide-react"
import { useTranslations } from "next-intl"
import { Logo } from "@/components/Logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  const t = useTranslations("Header")

  return (
    <header className="sticky top-0 z-40 bg-primary bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgb(255_255_255/0.07)_14px_28px)] text-primary-foreground shadow-md dark:bg-[hsl(352_70%_46%)]">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:max-w-[640px]">
        <Logo inverted />

        <nav className="flex items-center gap-3">
          <Link
            href="/vragen"
            aria-label={t("faq")}
            className="rounded-full p-1.5 text-primary-foreground/90 transition-colors hover:bg-white/15 hover:text-primary-foreground"
          >
            <CircleHelp aria-hidden size="24" />
          </Link>
          {session && (
            <Link href="/profile" aria-label={t("profile")}>
              <Avatar className="text-foreground ring-2 ring-white/70 shadow-sm transition-transform hover:scale-105">
                {session.user.image && (
                  <AvatarImage src={session.user.image} alt="" />
                )}
                <AvatarFallback>
                  {getInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
