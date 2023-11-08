import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import InstagramProvider from "next-auth/providers/instagram"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "~/lib/prisma"
import { updateUserById } from "~/lib/users/updateUserById"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile: (profile) => ({
        id: profile.sub,
        name: profile.name,
        firstName: profile.given_name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
      }),
    }),
    InstagramProvider({
      clientId: process.env.INSTAGRAM_CLIENT_ID as string,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      session.user.id = user.id
      session.user.firstName = user.firstName || user.name?.split(" ")[0]
      session.user.isAdmin = user.id === process.env.ADMIN_USER_ID

      return session
    },
  },
  events: {
    signIn: async ({ profile, user, isNewUser }) => {
      if (!isNewUser && !user.firstName && profile?.firstName) {
        await updateUserById(user.id, {
          firstName: profile.firstName,
        })
      }
    },
  },
}

export default NextAuth(authOptions)
