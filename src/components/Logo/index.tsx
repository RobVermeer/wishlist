import { cn } from "@/lib/utils"
import { Gift } from "lucide-react"
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
            ? "bg-white text-primary dark:text-[hsl(350_55%_28%)]"
            : "bg-primary text-primary-foreground"
        )}
      >
        <Gift size="20" strokeWidth="2.25" />
      </span>
      Wishlist
    </Link>
  )
}
