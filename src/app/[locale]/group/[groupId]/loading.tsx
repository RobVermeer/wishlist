import { Skeleton } from "@/components/ui/skeleton"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Separator } from "@/components/ui/separator"

export default function LoadingWishlist() {
  return (
    <List>
      <ListTitle>
        <Skeleton className="w-[110px] h-[32px] rounded-md" />
      </ListTitle>

      <Skeleton className="w-full h-[48px] rounded-md" />
      <Skeleton className="w-full h-[48px] rounded-md" />
      <Skeleton className="w-full h-[48px] rounded-md" />

      <Separator className="my-3" />

      <Skeleton className="w-full h-[40px] rounded-md" />
    </List>
  )
}
