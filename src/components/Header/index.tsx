import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  return (
    <header
      className="p-4 flex h-64 bg-cover bg-center items-start justify-between"
      style={{ backgroundImage: "url('/sinterklaas.jpg')" }}
    >
      <Logo />

      {session && <Menu session={session} />}
    </header>
  )
}
