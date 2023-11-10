import { prisma } from "@/lib/prisma"
import { updateFirstNameById } from "@/lib/users/updateFirstNameById"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import NextAuth, { AuthOptions, Session, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: (profile) => ({
        id: profile.sub,
        name: profile.name,
        firstName: profile.given_name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
      }),
    }),
  ],
  callbacks: {
    session: ({ session, user }: { session: Session; user: User }) => {
      session.user.id = user.id
      session.user.firstName = user.firstName || user.name?.split(" ")[0]
      session.user.isAdmin = user.id === process.env.ADMIN_USER_ID

      return session
    },
  },
  events: {
    signIn: async ({ profile, user, isNewUser }) => {
      if (!isNewUser && !user.firstName && profile?.firstName) {
        await updateFirstNameById(user.id, profile.firstName)
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
