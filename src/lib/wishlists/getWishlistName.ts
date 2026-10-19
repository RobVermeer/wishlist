import { getFirstName } from "@/lib/users/getFirstName"

interface Wishlist {
  title: string | null
  user: { firstName: string | null; name: string | null }
}

export function getWishlistName({ title, user }: Wishlist) {
  return title || getFirstName(user)
}
