import { Skeleton } from "@/components/ui/skeleton"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Separator } from "@/components/ui/separator"

export default function LoadingWishlist() {
  return (
    <List>
      <div className="text-center">
        <Skeleton className="inline-block w-14 h-14 rounded-full" />

        <ListTitle>
          <Skeleton className="inline-block w-[110px] h-[27px] rounded-md" />
        </ListTitle>
      </div>

      <Skeleton className="w-full h-[48px] rounded-md" />
      <Skeleton className="w-full h-[48px] rounded-md" />
      <Skeleton className="w-full h-[48px] rounded-md" />

      <Separator className="my-3" />

      <Skeleton className="w-full h-[40px] rounded-md" />
    </List>
  )
}
