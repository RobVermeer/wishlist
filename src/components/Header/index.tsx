import { Session } from "next-auth"
import { Logo } from "@/components/Logo"
import { Menu } from "./Menu"
import { getGroupById } from "@/lib/groups/getGroupById"

interface Props {
  session: Session | null
  group?: Awaited<ReturnType<typeof getGroupById>>
}

export function Header({ session, group }: Props) {
  return (
    <header
      className="relative p-4 flex h-64 bg-cover bg-center items-start justify-between"
      style={{
        backgroundImage:
          typeof group?.theme === "string"
            ? `url('/${group.theme}.jpg')`
            : "url('/background.jpg')",
      }}
    >
      <div className="absolute inset-0 -translate-y-1/3 bg-gradient-to-b from-black to-transparent" />
      <Logo className="relative z-10 text-white" />

      {session && <Menu session={session} />}
    </header>
  )
}
