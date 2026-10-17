import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 items-center justify-between px-4 md:max-w-[640px]">
        <Logo />

        {session && <Menu session={session} />}
      </div>
    </header>
  )
}
