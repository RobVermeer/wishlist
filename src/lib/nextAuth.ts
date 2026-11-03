import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { AuthOptions, Session, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { sendVerificationRequest } from "@/lib/email/sendVerificationRequest"
import { updateLastSeen } from "@/lib/users/updateLastSeen"
import { isSuperAdmin } from "@/lib/users/isSuperAdmin"
import { userSchema } from "@/lib/schema"

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
      from: "Niet Weer Sokken <no-reply@nietweersokken.nl>",
      sendVerificationRequest,
    }),
  ],
  callbacks: {
    session: async ({ session, user }: { session: Session; user: User }) => {
      await updateLastSeen(user)

      session.user.id = user.id
      session.user.firstName = user.firstName
      session.user.isSuperAdmin = isSuperAdmin(user.id)
      session.user.isAdmin = session.user.isSuperAdmin || !!user.isAdmin

      return session
    },
  },
  events: {
    // Fills in the first name from Google for someone who signed up by
    // e-mail. This runs before the session cookie is set, so it writes
    // directly instead of through the server action, which needs a session.
    signIn: async ({ profile, user, isNewUser }) => {
      if (isNewUser || user.firstName) return

      const result = userSchema.safeParse({ firstName: profile?.firstName })

      if (result.success) {
        await prisma.user.update({
          data: { firstName: result.data.firstName },
          where: { id: user.id },
        })
      }
    },
  },
}
