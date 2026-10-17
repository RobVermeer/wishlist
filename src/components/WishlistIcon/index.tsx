import {
  Baby,
  Backpack,
  Bone,
  Cake,
  CandyCane,
  House,
  ScrollText,
  Shirt,
  Trophy,
  Wrench,
} from "lucide-react"

interface Props {
  theme: string | null
  className?: string
}

export const WishlistIcon = ({ theme, className }: Props) => {
  switch (theme) {
    case "birthday":
      return <Cake size="32" strokeWidth="2" className={className} />
    case "holidays":
      return <CandyCane size="32" strokeWidth="2" className={className} />
    case "home":
      return <House size="32" strokeWidth="2" className={className} />
    case "travel":
      return <Backpack size="32" strokeWidth="2" className={className} />
    case "clothing":
      return <Shirt size="32" strokeWidth="2" className={className} />
    case "baby":
      return <Baby size="32" strokeWidth="2" className={className} />
    case "sports":
      return <Trophy size="32" strokeWidth="2" className={className} />
    case "tools":
      return <Wrench size="32" strokeWidth="2" className={className} />
    case "pet":
      return <Bone size="32" strokeWidth="2" className={className} />
    default:
      return <ScrollText size="32" strokeWidth="2" className={className} />
  }
}

export const wishlistColors = (theme: string | null) => {
  switch (theme) {
    case "birthday":
      return "bg-pink-100 text-pink-700 dark:bg-pink-400/25 dark:text-pink-200"
    case "holidays":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/25 dark:text-emerald-200"
    case "home":
      return "bg-amber-100 text-amber-700 dark:bg-amber-400/25 dark:text-amber-200"
    case "travel":
      return "bg-sky-100 text-sky-700 dark:bg-sky-400/25 dark:text-sky-200"
    case "clothing":
      return "bg-violet-100 text-violet-700 dark:bg-violet-400/25 dark:text-violet-200"
    case "baby":
      return "bg-teal-100 text-teal-700 dark:bg-teal-400/25 dark:text-teal-200"
    case "sports":
      return "bg-orange-100 text-orange-700 dark:bg-orange-400/25 dark:text-orange-200"
    case "tools":
      return "bg-stone-200 text-stone-700 dark:bg-stone-400/25 dark:text-stone-200"
    case "pet":
      return "bg-lime-100 text-lime-700 dark:bg-lime-400/25 dark:text-lime-200"
    default:
      return "bg-rose-100 text-rose-700 dark:bg-rose-400/25 dark:text-rose-200"
  }
}
