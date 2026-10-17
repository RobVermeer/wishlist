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
      return "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300"
    case "holidays":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
    case "home":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
    case "travel":
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300"
    case "clothing":
      return "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"
    case "baby":
      return "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300"
    case "sports":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300"
    case "tools":
      return "bg-stone-200 text-stone-700 dark:bg-stone-800/60 dark:text-stone-300"
    case "pet":
      return "bg-lime-100 text-lime-700 dark:bg-lime-950/50 dark:text-lime-300"
    default:
      return "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
  }
}
