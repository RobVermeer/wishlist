import { cn } from "@/lib/utils"
import { Gift } from "lucide-react"
import Link from "next/link"

interface Props {
  className?: string
  onClick?: () => void
}

export function Logo({ className = "text-white", onClick }: Props) {
  return (
    <Link
      href="/"
      className={cn(className, "text-2xl leading-none flex items-center ")}
      scroll={false}
      onClick={onClick}
    >
      <Gift size="24" strokeWidth="2" className="text-pink-500 mr-1" /> Wishlist
    </Link>
  )
}
