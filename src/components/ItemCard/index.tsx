import { Card } from "@/components/Card"
import { clsx } from "clsx"
import { CheckSquare, Link, Square } from "lucide-react"
import { useMemo } from "react"
import { Button } from "../ui/button"
import { ToggleItem } from "../ToggleItem"

export const ItemCard = ({ item }) => {
  const { id, title, url, boughtBy } = item
  const className = useMemo(() => {
    if (boughtBy) {
      return "line-through text-slate-400"
    }

    return ""
  }, [boughtBy])

  return (
    <Card className={clsx(className, "flex items-center")}>
      {url && (
        <a href={url} className="inline-flex gap-2 items-center">
          <Link size="16" /> {title}
        </a>
      )}

      {!url && title}

      <ToggleItem item={item} />
    </Card>
  )
}
