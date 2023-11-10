import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"

interface Props {
  session: Session | null
}

export function Header({ session }: Props) {
  return (
    <header
      className="relative p-4 flex h-64 bg-cover bg-center items-start justify-between"
      style={{ backgroundImage: "url('/sinterklaas.jpg')" }}
    >
      <div className="absolute inset-0 -translate-y-1/3 bg-gradient-to-b from-black to-transparent" />
      <Logo className="relative z-10 text-white" />

      {session && <Menu session={session} />}
    </header>
  )
}
