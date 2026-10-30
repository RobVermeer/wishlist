import { cn } from "@/lib/utils"
import { SockIcon } from "@/components/SockIcon"
import Link from "next/link"

interface Props {
  className?: string
  inverted?: boolean
  onClick?: () => void
}

export function Logo({ className, inverted = false, onClick }: Props) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-display text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      scroll={false}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-9 -rotate-6 items-center justify-center rounded-xl shadow-sm",
          inverted
            ? "bg-white text-primary dark:text-[hsl(352_70%_46%)]"
            : "bg-primary text-primary-foreground"
        )}
      >
        <SockIcon size={26} />
      </span>
      Wishlist
    </Link>
  )
}
