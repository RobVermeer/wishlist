import { GetServerSideProps, GetServerSidePropsContext } from "next"
import { Session, unstable_getServerSession } from "next-auth"
import { getCookie, deleteCookie, setCookie } from "cookies-next"
import { authOptions } from "pages_old/api/auth/[...nextauth]"

export interface GetPagePropsType extends GetServerSidePropsContext {
  session: Session | null
}

type WithBaseProps = (
  ctx: GetServerSidePropsContext,
  getPageProps: (context: GetPagePropsType) => ReturnType<GetServerSideProps>
) => ReturnType<GetServerSideProps>

export const withBaseProps: WithBaseProps = async (ctx, getPageProps) => {
  const { req, res, resolvedUrl, query } = ctx

  const session = await unstable_getServerSession(req, res, authOptions)
  const groupId = getCookie("groupId", { req, res })

  if (session && groupId) {
    deleteCookie("groupId", { req, res })

    return {
      redirect: {
        destination: `/group/${groupId}`,
        permanent: false,
      },
    }
  }

  if (!session && resolvedUrl !== "/") {
    if (query.groupId) {
      setCookie("groupId", query.groupId, {
        req,
        res,
        maxAge: 30 * 24 * 60 * 60,
      })
    }

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
