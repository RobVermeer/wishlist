import { Card } from "@/components/Card"
import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { getBoughtWishlistItemsForUser } from "@/lib/wishlistItems/getBoughtWishlistItemsForUser"

export const metadata = {
  title: "Mijn gekochte cadeaus - Profiel - Wishlist",
}

export default async function ProfileBoughtPage() {
  const boughtWishlistItems = await getBoughtWishlistItemsForUser()

  return (
    <List>
      {boughtWishlistItems.length === 0 && (
        <EmptyState title="Het ziet er naar uit dat je nog geen cadeaus hebt afgestreept 🤨" />
      )}

      {boughtWishlistItems.map((item) => (
        <Card key={item.id} className="flex justify-between items-center">
          {item.title}{" "}
          <small className="text-muted-foreground">
            Gekocht voor{" "}
            {item.wishlist.title ??
              item.wishlist.user.firstName ??
              item.wishlist.user.name?.split(" ")[0]}
          </small>
        </Card>
      ))}
    </List>
  )
}
