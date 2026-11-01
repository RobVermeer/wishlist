import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    firstName: string | undefined
    lastSeenAt?: Date | null
    isAdmin?: boolean
  }

  interface Profile {
    firstName: string | undefined
  }
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID. */
      id: string
      /** The user's first name. */
      firstName: string | undefined
      /** Is the user an admin. */
      isAdmin: boolean
      /** Is the user the super admin from ADMIN_USER_ID, who manages admins. */
      isSuperAdmin: boolean
    } & DefaultSession["user"]
  }
}
