import {
  Backpack,
  Bone,
  Cake,
  CandyCane,
  Home,
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
      return <Home size="32" strokeWidth="2" className={className} />
    case "travel":
      return <Backpack size="32" strokeWidth="2" className={className} />
    case "clothing":
      return <Shirt size="32" strokeWidth="2" className={className} />
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
