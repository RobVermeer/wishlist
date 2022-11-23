import { unstable_getServerSession } from "next-auth"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import { NotLoggedIn } from "~/components/NotLoggedIn"
import { Home } from "~/components/Home"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"

export default async function Page() {
  const session = await unstable_getServerSession(authOptions)

  if (!session) {
    return <NotLoggedIn />
  }

  const { user } = session
  const groupsData = await getGroupsForUser(user.id)
  const wishlistsData = await getWishlistsForUser(user.id)

  return (
    <Home
      userId={user.id}
      initialGroups={{ data: groupsData } as unknown as GroupProperties[]}
      initialWishlists={
        { data: wishlistsData } as unknown as WishlistProperties[]
      }
    />
  )
}
