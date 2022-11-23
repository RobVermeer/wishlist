import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { GroupProperties } from "~/lib/groups/publicProperties"
import {
  BoughtWishlistItemProperties,
  getBoughtWishlistItemsForUser,
} from "~/lib/wishlistItems/getBoughtWishlistItemsForUser"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import ProfilePage from "./content"

export default async function Page({
  searchParams,
}: {
  searchParams: { groups: any; wishlists: any }
}) {
  const session = await unstable_getServerSession(authOptions)

  if (!session) notFound()

  const { user } = session
  const initialTab = "groups" in searchParams ? "groups" : "wishlists"
  const wishlistsData = await getWishlistsForUser(user.id)
  const groupsData = await getGroupsForUser(user.id)
  const boughtWishlistItems = await getBoughtWishlistItemsForUser(user.id)

  return (
    <ProfilePage
      session={session}
      boughtWishlistItems={
        boughtWishlistItems as unknown as BoughtWishlistItemProperties[]
      }
      initialGroups={{ data: groupsData } as unknown as GroupProperties[]}
      initialTab={initialTab}
      initialWishlists={
        { data: wishlistsData } as unknown as WishlistProperties[]
      }
    />
  )
}
