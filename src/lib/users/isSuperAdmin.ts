import "server-only"

export const isSuperAdmin = (userId: string) =>
  !!process.env.ADMIN_USER_ID && userId === process.env.ADMIN_USER_ID
