import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-primary bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgb(255_255_255/0.07)_14px_28px)] text-primary-foreground shadow-md dark:bg-[hsl(350_55%_28%)]">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:max-w-[640px]">
        <Logo inverted />

        {session && <Menu session={session} />}
      </div>
    </header>
  )
}
