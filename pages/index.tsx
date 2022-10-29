import { GetServerSideProps } from "next"
import { Session } from "next-auth"
import { Home } from "~/components/Home"
import { NotLoggedIn } from "~/components/NotLoggedIn"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import { withBaseProps } from "~/utils/withBaseProps"

interface HomePageProps {
  session: Session
  initialGroups: GroupProperties[]
  initialWishlists: WishlistProperties[]
}

function HomePage({ session, initialGroups, initialWishlists }: HomePageProps) {
  if (!session) return <NotLoggedIn />

  return (
    <Home
      userId={session.userId as string}
      initialGroups={initialGroups}
      initialWishlists={initialWishlists}
    />
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session) {
      return {
        props: {},
      }
    }

    const groupsData = await getGroupsForUser(session.userId as string)
    const wishlistsData = await getWishlistsForUser(session.userId as string)

    return {
      props: {
        initialGroups: { data: groupsData },
        initialWishlists: { data: wishlistsData },
      },
    }
  })
}

export default HomePage
