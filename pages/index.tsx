import { GetServerSideProps } from "next"
import { Home } from "~/components/Home"
import { NotLoggedIn } from "~/components/NotLoggedIn"
import { getGroupsForUser } from "~/lib/groups/getGroupsForUser"
import { withBaseProps } from "~/utils/withBaseProps"

function HomePage({ session, initialGroups }) {
  if (!session) return <NotLoggedIn />

  return <Home userId={session.userId} initialGroups={initialGroups} />
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { session } = context

    if (!session) {
      return {
        props: {},
      }
    }

    const data = await getGroupsForUser(session.userId)

    return {
      props: {
        initialGroups: { data },
      },
    }
  })
}

export default HomePage
