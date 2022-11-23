import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getGroupById } from "~/lib/groups/getGroupById"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import GroupWishlistPage from "./content"

export default async function Page({
  params,
}: {
  params: { groupId: string; wishlistId: string }
}) {
  const { groupId, wishlistId } = params
  const session = await unstable_getServerSession(authOptions)
  const wishlistData = await getWishlistById(wishlistId)
  const groupData = await getGroupById(groupId)

  if (!wishlistData || !groupData || !session) notFound()

  return (
    <GroupWishlistPage
      groupId={groupId}
      wishlistId={wishlistId}
      session={session}
      initialWishlistData={
        {
          data: wishlistData,
        } as unknown as WishlistProperties[]
      }
      initialGroupData={{ data: groupData } as unknown as GroupProperties[]}
    />
  )
}
