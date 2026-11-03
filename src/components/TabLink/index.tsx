import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ReactNode } from "react"

interface Props {
  href: string
  active: boolean
  className?: string
  children: ReactNode
}

// Tabs aren't the next step, so they stay quiet: the open one is marked with
// a background and an underline, so it doesn't depend on colour alone.
export const TabLink = ({ href, active, className, children }: Props) => (
  <Button
    variant="outline"
    className={cn(
      "aria-[current=page]:bg-secondary aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-4",
      className
    )}
    asChild
  >
    <Link href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  </Button>
)
