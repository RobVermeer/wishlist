import { List } from "@/components/List"
import { NewWishlist } from "@/components/NewWishlist"
import { YourWishlistCard } from "@/components/YourWishlistCard"
import { getGroups } from "@/lib/groups/getGroups"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"

export const metadata = {
  title: "Mijn verlanglijstjes - Profiel - Wishlist",
}

export default async function ProfilePage() {
  const wishlists = await getWishlistsForUser()
  const groups = await getGroups()

  return (
    <>
      <List>
        {wishlists.length === 0 && (
          <p>Je hebt nog geen lijstjes gemaakt, doe dit snel! 🥳</p>
        )}

        {wishlists.map((wishlist) => (
          <YourWishlistCard
            key={wishlist.id}
            wishlist={wishlist}
            groups={groups}
          />
        ))}
      </List>

      <NewWishlist groups={groups} />
    </>
  )
}
