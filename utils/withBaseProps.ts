import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { Session, unstable_getServerSession } from "next-auth"
import { authOptions } from "~/pages/api/auth/[...nextauth]"

export interface GetPagePropsType extends GetServerSidePropsContext {
  session: Session
}

type WithBaseProps = (
  ctx: GetServerSidePropsContext,
  getPageProps: (context: GetPagePropsType) => ReturnType<GetServerSideProps>
) => ReturnType<GetServerSideProps>

export const withBaseProps: WithBaseProps = async (ctx, getPageProps) => {
  const { req, res, resolvedUrl } = ctx

  console.log(resolvedUrl)

  const session = await unstable_getServerSession(req, res, authOptions)

  if (!session && resolvedUrl !== "/") {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    }
  }

  const baseProps = { session }

  const response = await getPageProps({ ...ctx, session })

  if (!("props" in response)) {
    return response
  }

  return {
    props: { ...response.props, ...baseProps },
  }
}
