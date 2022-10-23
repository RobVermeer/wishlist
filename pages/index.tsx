import { GetServerSideProps } from "next"
import { Home } from "~/components/Home"
import { NotLoggedIn } from "~/components/NotLoggedIn"
import { withBaseProps } from "~/utils/withBaseProps"

function HomePage({ session }) {
  if (!session) return <NotLoggedIn />

  return <Home userId={session.userId} />
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({ props: { title: "Home" } }))
}

export default HomePage
