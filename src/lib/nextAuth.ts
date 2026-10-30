import { prisma } from "@/lib/prisma"
import { updateFirstNameById } from "@/lib/users/updateFirstNameById"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { AuthOptions, Session, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { sendVerificationRequest } from "@/lib/email/sendVerificationRequest"
import { trackIssue } from "@/lib/trackIssue"
import { updateLastSeen } from "@/lib/users/updateLastSeen"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile: profile => ({
        id: profile.sub,
        name: profile.name,
        firstName: profile.given_name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
      }),
    }),
    EmailProvider({
      server: "",
      from: "Niet Weer Sokken <no-reply@ru-coding.nl>",
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      await updateLastSeen(user)

      session.user.id = user.id
      session.user.firstName = user.firstName
      session.user.isAdmin = user.id === process.env.ADMIN_USER_ID

      return session
    },
  },
  events: {
    signIn: async ({ profile, user, isNewUser }) => {
      if (isNewUser) {
        trackIssue("User registered", "info", user)
      } else {
        trackIssue("User sign in", "info", user)
      }

      if (!isNewUser && !user.firstName && profile?.firstName) {
        await updateFirstNameById(user.id, profile.firstName)
      }
    },
    signOut: ({ session }) => {
      trackIssue("User sign out", "info", session.user)
    },
  },
}
