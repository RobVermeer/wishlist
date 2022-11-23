import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import ProfileWishlistPage from "./content"

export default async function Page({ params }: { params: { id: string } }) {
  const session = await unstable_getServerSession(authOptions)

  if (!session) notFound()

  const data = await getWishlistById(params.id as string)

  return (
    <ProfileWishlistPage
      initialData={{ data } as unknown as WishlistProperties[]}
      params={params}
    />
  )
}
