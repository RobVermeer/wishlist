import { GetServerSideProps } from "next"
import { Home } from "~/components/Home"
import { NotLoggedIn } from "~/components/NotLoggedIn"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { getWishlistsForUser } from "~/lib/wishlists/getWishlistsForUser"
import { withBaseProps } from "~/utils/withBaseProps"

function HomePage({ session, initialGroups, initialWishlists }) {
  if (!session) return <NotLoggedIn />

  return (
    <Home
      userId={session.userId}
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

    const groupsData = await getGroupsForUser(session.userId)
    const wishlistsData = await getWishlistsForUser(session.userId)

    return {
      props: {
        initialGroups: { data: groupsData },
        initialWishlists: { data: wishlistsData },
      },
    }
  })
}

export default HomePage
