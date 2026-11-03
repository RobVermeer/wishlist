import { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"

interface Props {
  title: ReactNode
  avatar?: { image: string; name: string | null } | null
  action?: ReactNode
  as?: "h1" | "h2"
  children?: ReactNode
}

// The title at the top of a verlanglijstje, with the lines below it as children.
export const PageTitle = ({
  title,
  avatar,
  action,
  as: Heading = "h1",
  children,
}: Props) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex min-w-0 items-center gap-3">
      {avatar && (
        <Avatar className="size-12 shrink-0 ring-2 ring-white/70 shadow-sm">
          <AvatarImage src={avatar.image} alt="" />
          <AvatarFallback>{getInitials(avatar.name)}</AvatarFallback>
        </Avatar>
      )}
      <div className="grid min-w-0 gap-0.5">
        <Heading className="font-display text-3xl font-semibold tracking-tight">
          {title}
        </Heading>
        {children}
      </div>
    </div>
    {action}
  </div>
)
