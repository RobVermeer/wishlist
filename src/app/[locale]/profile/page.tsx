import { EmptyState } from "@/components/EmptyState"
import { List } from "@/components/List"
import { NewWishlist } from "@/components/NewWishlist"
import { YourWishlistCard } from "@/components/YourWishlistCard"
import { Separator } from "@/components/ui/separator"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"

export const metadata = {
  title: "Mijn verlanglijstjes - Profiel - Wishlist",
}

export default async function ProfilePage() {
  const wishlists = await getWishlistsForUser()
  const groups = await getGroupsForUser()

  return (
    <List>
      {wishlists.length === 0 && (
        <EmptyState title="Je hebt nog geen lijstjes gemaakt, doe dit snel! 🥳" />
      )}

      {wishlists.map((wishlist) => (
        <YourWishlistCard
          key={wishlist.id}
          wishlist={wishlist}
          groups={groups}
        />
      ))}

      <Separator className="my-3" />

      <NewWishlist groups={groups} />
    </List>
  )
}
