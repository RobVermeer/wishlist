import { useQuery } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { Cards } from "~/components/Cards"
import { CardWishlist } from "~/components/CardWishlist"
import { CreateWishlist } from "~/components/CreateWishlist"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { withBaseProps } from "~/utils/withBaseProps"
import { Tabs } from "~/components/Tabs"
import { ProfileNavBar } from "~/components/ProfileNavBar"

interface ProfilePage {
  session: Session
  initialWishlists: WishlistProperties[]
}

function ProfilePage({ session, initialWishlists }: ProfilePage) {
  const { user } = session
  const { id: userId } = user
  const { data: wishlistData = {} } = useQuery(
    ["wishlists", userId],
    () => fetch("/api/user/wishlists").then((res) => res.json()),
    { initialData: initialWishlists }
  )
  const { data: wishlists = [] } = wishlistData

  return (
    <div>
      <ProfileNavBar />

      <Tabs activeTab="wishlists">
        <Cards>
          {wishlists.length === 0 && (
            <p>Je hebt nog geen lijstjes gemaakt, doe dit snel! 🥳</p>
          )}

          {wishlists.map((wishlist: WishlistProperties, index: number) => (
            <CardWishlist
              key={wishlist.id}
              wishlist={wishlist}
              index={index}
              showEdit
              showGroups
            />
          ))}

          <CreateWishlist userId={userId} />
        </Cards>
      </Tabs>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session) return { notFound: true }

    const wishlistsData = await getWishlistsForUser(session?.user.id)

    return {
      props: {
        title: session?.user.firstName || session?.user.name,
        initialWishlists: { data: wishlistsData },
      },
    }
  })
}

export default ProfilePage
